import json
import joblib
import numpy as np
import pandas as pd

EMBEDDINGS_NPY = "image_embeddings.npy"
METADATA_JSON = "image_metadata.json"
SALES_CSV = "watch_sales_template.csv"
OUTPUT_MODEL = "condition_classifier.joblib"

def main():
    # Load image embeddings + metadata
    emb = np.load(EMBEDDINGS_NPY)  # shape [N, 768]
    with open("image_metadata.json", "r", encoding="utf-8") as f:
        meta = json.load(f)

    img_df = pd.DataFrame(meta)  # has listing_id, reference_number, image_path...

    # Load sales with conditions
    sales_df = pd.read_csv(SALES_CSV)

    # Normalize condition
    def norm_cond(c):
        if not isinstance(c, str):
            return None
        c = c.strip().lower()
        if "new" in c and "like" not in c:
            return "new"
        if "like new" in c:
            return "like_new"
        if "very good" in c:
            return "very_good"
        if "good" in c:
            return "good"
        if "fair" in c or "ok" in c:
            return "fair"
        return None

    sales_df["condition_norm"] = sales_df["condition"].apply(norm_cond)

    # Merge on listing_id
    merged = img_df.merge(
        sales_df[["listing_id", "condition_norm"]],
        on="listing_id",
        how="left"
    )

    # Keep only rows with a known condition
    mask = merged["condition_norm"].notna()
    X = emb[mask.values]
    y = merged["condition_norm"][mask].values

    print("Training samples:", X.shape[0])
    if X.shape[0] < 10:
        print("Not enough labeled samples. Label more conditions first.")
        return

    # Simple classifier: Logistic Regression
    from sklearn.linear_model import LogisticRegression
    clf = LogisticRegression(max_iter=200, multi_class="auto")
    clf.fit(X, y)

    joblib.dump(clf, OUTPUT_MODEL)
    print(f"Saved condition classifier to {OUTPUT_MODEL}")

if __name__ == "__main__":
    main()
