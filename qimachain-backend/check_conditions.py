import pandas as pd

df = pd.read_csv('data/watch_sales_template.csv')

def normalize_condition(c):
    if not isinstance(c, str):
        return "unknown"
    c = c.strip().lower()
    c = c.replace(" ", "_").replace("(", "_").replace(")", "_")
    return c

df['condition_norm'] = df['condition'].apply(normalize_condition)

print("Original conditions:")
print(df['condition'].unique())
print("\nNormalized conditions:")
print(df['condition_norm'].unique())
print("\nCondition value counts:")
print(df['condition_norm'].value_counts())
