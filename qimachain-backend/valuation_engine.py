import pandas as pd
import numpy as np
import joblib

SALES_CSV = "watch_sales_template.csv"
PRICE_MODEL_PATH = "price_model.joblib"


class ValuationEngine:
    def __init__(self, csv_path: str = SALES_CSV):
        df = pd.read_csv(csv_path)

        # Drop rows with missing or placeholder prices
        df = df[df["price"].notna()]
        df = df[df["price"] != "____"]

        # Convert price to numeric
        df["price"] = pd.to_numeric(df["price"], errors="coerce")
        df = df.dropna(subset=["price"])

        # Normalize reference_number as string
        df["reference_number"] = df["reference_number"].astype(str)
        df["brand"] = df["brand"].astype(str)
        df["source"] = df["source"].astype(str)

        # ---- Normalize has_box / has_papers ----
        def yn_to_int(x):
            if isinstance(x, str):
                x_lower = x.strip().lower()
                if x_lower in ["yes", "y", "true", "1"]:
                    return 1
                if x_lower in ["no", "n", "false", "0"]:
                    return 0
            if x in [0, 1]:
                return int(x)
            return np.nan  # unknown

        df["has_box_norm"] = df["has_box"].apply(yn_to_int)
        df["has_papers_norm"] = df["has_papers"].apply(yn_to_int)

        # ---- Normalize condition ----
        def normalize_condition(c):
            if not isinstance(c, str):
                return "unknown"
            c = c.strip().lower()
            c = c.replace(" ", "_").replace("(", "_").replace(")", "_")
            return c

        df["condition_norm"] = df["condition"].apply(normalize_condition)

        self.df = df

        # Load ML price model (if available)
        self.price_model = None
        self.price_model_meta = None
        self._load_price_model()

    def _load_price_model(self):
        try:
            bundle = joblib.load(PRICE_MODEL_PATH)
            self.price_model = bundle["pipeline"]
            self.price_model_meta = {
                "feature_cols_cat": bundle["feature_cols_cat"],
                "feature_cols_num": bundle["feature_cols_num"],
            }
            print(f"[ValuationEngine] Loaded ML price model from {PRICE_MODEL_PATH}")
        except Exception:
            self.price_model = None
            self.price_model_meta = None
            print("[ValuationEngine] No ML price model loaded (price_model.joblib not found or invalid)")

    # --- helper to compute stats, market risk, and confidence ---
    def _summarize(self, df, reference_number: str, filters_info: dict, ml_price: float | None):
        prices = df["price"].values
        mean_price = float(np.mean(prices))
        p10 = float(np.percentile(prices, 10))
        p90 = float(np.percentile(prices, 90))
        num = len(prices)

        # Spread-based market risk: 0 (tight) to ~1 (very volatile)
        spread_ratio = (p90 - p10) / mean_price if mean_price > 0 else 1.0
        market_risk = float(min(spread_ratio, 1.0))

        # Confidence: more comps + tighter spread = better
        num_score = min(num / 20.0, 0.3)      # up to +0.3
        spread_score = -min(spread_ratio, 0.3)  # up to -0.3 penalty
        confidence = 0.5 + num_score + spread_score
        confidence = float(max(0.1, min(0.99, confidence)))

        # Blend ML price with statistical mean if ML is available
        blended_price = mean_price
        if ml_price is not None:
            # Simple blend: 60% stats, 40% ML
            blended_price = 0.6 * mean_price + 0.4 * ml_price

        # Simple natural-language-ish explanation
        explanation_lines = []

        explanation_lines.append(
            f"Valuation is based on {num} recent market observations for reference {reference_number}."
        )
        explanation_lines.append(
            f"Observed prices cluster between {p10:.0f} and {p90:.0f} {df['currency'].iloc[0]}, "
            f"with an average around {mean_price:.0f}."
        )

        if filters_info.get("condition_applied"):
            explanation_lines.append("Comparables were filtered by condition to better match this watch.")
        if filters_info.get("box_applied"):
            explanation_lines.append("Listings including original box were preferred when possible.")
        if filters_info.get("papers_applied"):
            explanation_lines.append("Listings including original papers were preferred when possible.")

        if not any([filters_info.get("condition_applied"),
                    filters_info.get("box_applied"),
                    filters_info.get("papers_applied")]):
            explanation_lines.append("No additional filters (condition/box/papers) were applied due to limited data.")

        if market_risk < 0.3:
            explanation_lines.append("Price dispersion is low, indicating a relatively stable market for this reference.")
        elif market_risk < 0.6:
            explanation_lines.append("Price dispersion is moderate, reflecting some variation in market conditions.")
        else:
            explanation_lines.append("Price dispersion is high, indicating a volatile or thin market for this reference.")

        if confidence > 0.8:
            explanation_lines.append("Overall valuation confidence is high based on data volume and stability.")
        elif confidence > 0.6:
            explanation_lines.append("Overall valuation confidence is moderate.")
        else:
            explanation_lines.append("Overall valuation confidence is limited due to data constraints.")

        if ml_price is not None:
            explanation_lines.append(
                f"An ML regression model was also used to refine the price estimate, suggesting around {ml_price:.0f}."
            )

        explanation = " ".join(explanation_lines)

        return {
            "reference_number": str(reference_number),
            "valuation": round(blended_price, 2),
            "baseline_mean_price": round(mean_price, 2),
            "ml_price": round(ml_price, 2) if ml_price is not None else None,
            "currency": df["currency"].iloc[0],
            "price_range": [round(p10, 2), round(p90, 2)],
            "num_comparables": int(num),
            "confidence": confidence,
            "market_risk": market_risk,
            "filters_applied": filters_info,
            "explanation": explanation,
        }

    def _predict_ml_price(self, ref_df, condition: str | None, has_box: int | None, has_papers: int | None):
        if self.price_model is None or self.price_model_meta is None or ref_df.empty:
            return None

        # Build a synthetic "target watch" row for prediction
        sample = ref_df.iloc[0].copy()

        # Use requested or fallback values
        brand = sample["brand"]
        reference_number = sample["reference_number"]
        source = sample["source"]  # arbitrary source from data

        cond = condition if condition is not None else sample["condition_norm"]
        box = has_box if has_box is not None else sample["has_box_norm"]
        papers = has_papers if has_papers is not None else sample["has_papers_norm"]

        feat_cat = {
            "brand": brand,
            "reference_number": reference_number,
            "condition_norm": cond,
            "source": source,
        }

        feat_num = {
            "has_box_norm": box,
            "has_papers_norm": papers,
        }

        # Build a single-row DataFrame for the pipeline
        data = {**feat_cat, **feat_num}
        X = pd.DataFrame([data])

        try:
            ml_price = float(self.price_model.predict(X)[0])
            return ml_price
        except Exception:
            return None

    def value_model(
        self,
        reference_number: str,
        condition: str | None = None,
        has_box: int | None = None,
        has_papers: int | None = None,
    ):
        """
        Soft filtering:
        - Start with all comps for that reference.
        - Try each filter; keep it only if it still leaves some rows.
        - If we end up with nothing, fall back to all comps for that ref.
        Also uses an optional ML regression model to refine the estimate.
        """
        base = self.df[self.df["reference_number"] == str(reference_number)]
        if base.empty:
            return None

        df = base.copy()

        filters_info = {
            "condition_requested": condition,
            "box_requested": has_box,
            "papers_requested": has_papers,
            "condition_applied": False,
            "box_applied": False,
            "papers_applied": False,
        }

        # 1) Condition filter (only if it actually matches something)
        if condition is not None:
            df_cond = df[df["condition_norm"] == condition]
            if not df_cond.empty:
                df = df_cond
                filters_info["condition_applied"] = True

        # 2) has_box filter
        if has_box is not None:
            df_box = df[df["has_box_norm"] == has_box]
            if not df_box.empty:
                df = df_box
                filters_info["box_applied"] = True

        # 3) has_papers filter
        if has_papers is not None:
            df_papers = df[df["has_papers_norm"] == has_papers]
            if not df_papers.empty:
                df = df_papers
                filters_info["papers_applied"] = True

        # If all filters together killed everything, fall back to base
        if df.empty:
            df = base
            filters_info["condition_applied"] = False
            filters_info["box_applied"] = False
            filters_info["papers_applied"] = False

        ml_price = self._predict_ml_price(base, condition, has_box, has_papers)

        return self._summarize(df, reference_number, filters_info, ml_price)


if __name__ == "__main__":
    engine = ValuationEngine()
    print("Unique refs:", engine.df["reference_number"].unique())
    # Quick smoke test – change to one of your refs:
    ref = str(engine.df["reference_number"].iloc[0])
    print("Test valuation:", engine.value_model(ref))
