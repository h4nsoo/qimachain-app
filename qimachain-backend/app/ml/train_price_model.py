import pandas as pd
import numpy as np
import joblib

from sklearn.ensemble import RandomForestRegressor
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline

SALES_CSV = "watch_sales_template.csv"
OUTPUT_MODEL = "price_model.joblib"


def load_and_clean():
    df = pd.read_csv(SALES_CSV)

    # Keep only rows with usable price
    df = df[df["price"].notna()]
    df = df[df["price"] != "____"]

    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df = df.dropna(subset=["price"])

    # Normalize some fields
    df["reference_number"] = df["reference_number"].astype(str)
    df["brand"] = df["brand"].astype(str)
    df["source"] = df["source"].astype(str)

    def yn_to_int(x):
        if isinstance(x, str):
            x_lower = x.strip().lower()
            if x_lower in ["yes", "y", "true", "1"]:
                return 1
            if x_lower in ["no", "n", "false", "0"]:
                return 0
        if x in [0, 1]:
            return int(x)
        return np.nan

    df["has_box_norm"] = df["has_box"].apply(yn_to_int)
    df["has_papers_norm"] = df["has_papers"].apply(yn_to_int)

    def normalize_condition(c):
        if not isinstance(c, str):
            return "unknown"
        c = c.strip().lower()
        c = c.replace(" ", "_").replace("(", "_").replace(")", "_")
        return c

    df["condition_norm"] = df["condition"].apply(normalize_condition)

    # Drop rows where everything is unknown
    df = df.dropna(subset=["has_box_norm", "has_papers_norm"])

    return df


def main():
    df = load_and_clean()
    if df.empty:
        print("No valid training data found in watch_sales_template.csv")
        return

    print("Training samples:", len(df))

    # Features and target
    feature_cols_cat = ["brand", "reference_number", "condition_norm", "source"]
    feature_cols_num = ["has_box_norm", "has_papers_norm"]
    target_col = "price"

    X_cat = df[feature_cols_cat]
    X_num = df[feature_cols_num]
    y = df[target_col]

    # Column transformer: one-hot encode categorical, pass numerical as-is
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), feature_cols_cat),
            ("num", "passthrough", feature_cols_num),
        ]
    )

    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        n_jobs=-1
    )

    pipe = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    pipe.fit(df[feature_cols_cat + feature_cols_num], y)

    joblib.dump(
        {
            "pipeline": pipe,
            "feature_cols_cat": feature_cols_cat,
            "feature_cols_num": feature_cols_num,
        },
        OUTPUT_MODEL,
    )

    print(f"Saved price regression model to {OUTPUT_MODEL}")


if __name__ == "__main__":
    main()
