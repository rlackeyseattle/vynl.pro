import os
import sys
import subprocess

# Ensure Pillow is installed
try:
    from PIL import Image
except ImportError:
    print("Installing Pillow library...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

src_image_path = r"C:\Users\rlack\.gemini\antigravity\brain\a9d9e8d4-9248-4d0b-bb41-712b790073ad\vynl_app_icon_1783407370283.png"
public_dir = r"C:\Users\rlack\vynl-pro\public"

if not os.path.exists(src_image_path):
    print(f"Error: Source image not found at {src_image_path}")
    sys.exit(1)

# Ensure public folder exists
os.makedirs(public_dir, exist_ok=True)

# List of sizes to output
targets = [
    ("apple-touch-icon.png", (180, 180)),
    ("icon-192.png", (192, 192)),
    ("icon-512.png", (512, 512)),
    ("icon.png", (512, 512)),
]

try:
    with Image.open(src_image_path) as img:
        for filename, size in targets:
            out_path = os.path.join(public_dir, filename)
            # Resize image with Lanczos filter for high quality
            resized_img = img.resize(size, Image.Resampling.LANCZOS)
            resized_img.save(out_path, "PNG")
            print(f"Generated: {out_path} ({size[0]}x{size[1]})")
    print("All mobile app icon sizes generated successfully!")
except Exception as e:
    print(f"Failed to generate icons: {e}")
    sys.exit(1)
