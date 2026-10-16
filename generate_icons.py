"""
Generate branded Android & PWA icons for NammaConnect
"""
import os
from PIL import Image, ImageDraw, ImageFont

def generate_icons():
    public_dir = r"c:\hackathon\frontend\public"
    res_dir = r"c:\hackathon\frontend\android\app\src\main\res"

    sizes = [
        (192, os.path.join(public_dir, "icon-192.png")),
        (512, os.path.join(public_dir, "icon-512.png")),
        (192, os.path.join(public_dir, "icon-maskable-192.png")),
        (512, os.path.join(public_dir, "icon-maskable-512.png")),
    ]

    # Native Android mipmap sizes
    android_sizes = [
        (48, os.path.join(res_dir, "mipmap-mdpi")),
        (72, os.path.join(res_dir, "mipmap-hdpi")),
        (96, os.path.join(res_dir, "mipmap-xhdpi")),
        (144, os.path.join(res_dir, "mipmap-xxhdpi")),
        (192, os.path.join(res_dir, "mipmap-xxxhdpi")),
    ]

    for size, path in sizes:
        img = Image.new("RGBA", (size, size), (15, 23, 42, 255)) # Dark slate background #0f172a
        draw = ImageDraw.Draw(img)

        # Draw rounded amber card / circle in center
        margin = size // 8
        draw.rounded_rectangle(
            [margin, margin, size - margin, size - margin],
            radius=size // 5,
            fill=(245, 158, 11, 255), # Amber #f59e0b
        )

        # Draw inner decorative element
        center_x = size // 2
        center_y = size // 2
        
        # Draw "NC" or letter
        try:
            # Try to load a font if available, or draw simple clean typography
            font_size = size // 3
            font = ImageFont.truetype("arial.ttf", font_size)
            draw.text((center_x, center_y), "NC", fill=(15, 23, 42, 255), font=font, anchor="mm")
        except Exception:
            # Fallback circle dot
            r = size // 6
            draw.ellipse([center_x - r, center_y - r, center_x + r, center_y + r], fill=(15, 23, 42, 255))

        img.save(path, "PNG")
        print(f"Generated {path}")

    # Generate android mipmap icons
    for size, folder in android_sizes:
        if os.path.exists(folder):
            img = Image.new("RGBA", (size, size), (245, 158, 11, 255))
            draw = ImageDraw.Draw(img)
            try:
                font_size = size // 2
                font = ImageFont.truetype("arial.ttf", font_size)
                draw.text((size // 2, size // 2), "NC", fill=(15, 23, 42, 255), font=font, anchor="mm")
            except Exception:
                r = size // 4
                draw.ellipse([size//2 - r, size//2 - r, size//2 + r, size//2 + r], fill=(15, 23, 42, 255))

            launcher_path = os.path.join(folder, "ic_launcher.png")
            round_path = os.path.join(folder, "ic_launcher_round.png")
            img.save(launcher_path, "PNG")
            img.save(round_path, "PNG")
            print(f"Updated Android icon: {launcher_path}")

    print("All icons successfully generated!")

if __name__ == "__main__":
    generate_icons()
