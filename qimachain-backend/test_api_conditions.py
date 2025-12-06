import requests
import os

API_URL = "http://localhost:8000"

# Test image path - use one from the data directory
test_image = "data/watches/rolex_submariner_116613/front_1.jpg"

if not os.path.exists(test_image):
    print(f"Test image not found: {test_image}")
    print("Creating a dummy test...")
    # We'll just test without an actual image for now
    import io
    from PIL import Image
    
    # Create a dummy image
    img = Image.new('RGB', (500, 500), color='blue')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    test_file = ('file', ('test.jpg', img_bytes, 'image/jpeg'))
else:
    test_file = ('file', open(test_image, 'rb'))

print("Testing API with different conditions:")
print("=" * 60)

conditions = ["mint", "excellent", "good", "heavy_wear"]

for condition in conditions:
    print(f"\nTesting with condition: {condition}")
    
    # Prepare form data
    form_data = {
        'condition': condition,
        'has_box': '1',
        'has_papers': '1'
    }
    
    try:
        # Reset file pointer if using real file
        if isinstance(test_file[1], tuple):
            test_file[1][1].seek(0)
        
        response = requests.post(
            f"{API_URL}/analyze/",
            data=form_data,
            files={'file': test_file[1]} if isinstance(test_file[1], tuple) else {'file': test_file[1]}
        )
        
        if response.status_code == 200:
            result = response.json()
            valuation = result.get('valuation', {})
            filters = valuation.get('filters_applied', {}) if valuation else {}
            
            print(f"  ✓ Status: {response.status_code}")
            print(f"  Condition requested: {filters.get('condition_requested')}")
            print(f"  Condition mapped: {filters.get('condition_mapped')}")
            print(f"  Condition applied: {filters.get('condition_applied')}")
            if valuation:
                print(f"  Valuation: {valuation.get('currency')} {valuation.get('valuation', 0):,.2f}")
                print(f"  Num comparables: {valuation.get('num_comparables')}")
        else:
            print(f"  ✗ Error: {response.status_code}")
            print(f"  Response: {response.text[:200]}")
    
    except Exception as e:
        print(f"  ✗ Exception: {e}")

print("\n" + "=" * 60)
