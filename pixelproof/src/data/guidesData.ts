/**
 * PixelProof — Educational Technical Guides
 * Practical, peer-grade articles on digital imaging fundamentals, algorithms, and web optimization.
 */

import { EducationalGuide } from '../types';

export const GUIDES: EducationalGuide[] = [
  {
    slug: 'image-dimensions-guide',
    title: 'How to Check and Verify Image Dimensions Accurately',
    summary: 'Understand pixel grids, CSS layout dimensions vs intrinsic raster dimensions, and how device pixel ratio (DPR) alters perception.',
    category: 'Dimensions & Geometry',
    readTime: '4 min read',
    lastUpdated: 'October 2026',
    relatedToolUrl: '/tools/image-dimensions',
    relatedToolName: 'Image Dimensions Checker',
    content: {
      introduction: 'Every raster image file is fundamentally a two-dimensional grid of color samples called picture elements (pixels). However, confusion frequently arises because an image possesses both an intrinsic physical pixel dimension and a rendered layout dimension governed by CSS, device displays, and viewport scaling.',
      sections: [
        {
          heading: '1. Intrinsic vs. Rendered Dimensions',
          body: [
            'An image\'s intrinsic dimension refers to the actual width and height in hardware pixel samples stored in the file header (e.g., 2400×1600 px). When a browser loads this file, it parses the IHDR chunk (in PNG) or SOF0 segment (in JPEG) to determine these bounds.',
            'Rendered dimensions, by contrast, are determined by CSS rules such as "max-width: 100%" or "height: auto". If a 2400px wide image is placed inside an 800px wide column, the browser scales it down by 3× during layout rendering, consuming bandwidth for pixels that are never drawn 1:1 on standard screens.',
          ],
        },
        {
          heading: '2. The Device Pixel Ratio (DPR) Factor',
          body: [
            'Modern smartphones and high-DPI (Retina) monitors display multiple physical device pixels for every CSS reference pixel. A standard DPR of 2.0 or 3.0 means an 800px CSS container requires a 1600px or 2400px intrinsic asset to render with sub-pixel sharpness.',
            'Checking dimensions before publishing ensures you do not serve a 6000×4000 raw camera file to a mobile phone (wasting cellular data) or upscale a 300px thumbnail into a hero banner (introducing severe blur and edge aliasing).',
          ],
          callout: {
            type: 'tip',
            text: 'Always check both width and height together with aspect ratio. Resizing only one dimension without locking ratio leads to squished or distorted subject matter.',
          },
        },
        {
          heading: '3. Browser Verification Techniques',
          body: [
            'While operating system file explorers often display image dimensions, they may fail with modern WebP or AVIF containers. PixelProof reads the raw byte headers directly using browser DataView APIs and renders the bitmap to verify exact rendered boundaries.',
          ],
        },
      ],
      limitations: [
        'Vector graphics (SVGs) do not have fixed pixel dimensions unless explicitly defined via viewBox, width, and height attributes.',
        'High-resolution imagery loaded into memory is constrained by available device RAM. Extremely massive images (e.g., > 100 megapixels) may be downsampled by mobile operating systems.',
      ],
      faq: [
        {
          question: 'Does changing the DPI or PPI change the image size on the web?',
          answer: 'No. On the web, browsers completely ignore PPI/DPI metadata tags for layout. An image that is 1920×1080 pixels will render identically whether marked as 72 DPI or 300 DPI.',
        },
        {
          question: 'What is the ideal hero image dimension for modern desktop websites?',
          answer: 'For full-width responsive desktop banners, 1920×1080 (16:9) or 2560×1440 for 2K displays with modern compression (WebP/AVIF) represents the optimal balance of crispness and payload size.',
        },
      ],
    },
  },
  {
    slug: 'aspect-ratios-explained',
    title: 'How Image Aspect Ratios Work: Math, Presets, and Cropping',
    summary: 'Master proportional fractions, the Euclidean GCD algorithm, standard cinematic/photographic ratios, and avoiding layout distortion.',
    category: 'Dimensions & Geometry',
    readTime: '5 min read',
    lastUpdated: 'October 2026',
    relatedToolUrl: '/tools/image-dimensions',
    relatedToolName: 'Image Dimensions Checker',
    content: {
      introduction: 'An aspect ratio defines the proportional mathematical relationship between an image\'s width and height. It is expressed as two numbers separated by a colon (such as 16:9 or 4:3) or as a decimal multiplier.',
      sections: [
        {
          heading: '1. The Mathematics: Greatest Common Divisor',
          body: [
            'To express an arbitrary resolution like 3840×2160 as an aspect ratio, we compute the Greatest Common Divisor (GCD) of both numbers using Euclid\'s algorithm.',
            'For 3840 and 2160, GCD(3840, 2160) = 240. Dividing 3840 by 240 gives 16, and dividing 2160 by 240 gives 9. Thus, 3840×2160 is mathematically an exact 16:9 ratio.',
          ],
        },
        {
          heading: '2. Standard Photographic & Media Ratios',
          body: [
            '1:1 (Square): Popularized by medium-format film cameras (Hasselblad) and modern avatar/product grids.',
            '3:2 (Classic 35mm): The standard for full-frame and APS-C digital SLR cameras since Oskar Barnack standardized 35mm film in 1913.',
            '4:3 (Traditional & Micro Four Thirds): Standard television format of the 20th century and native sensor format for Micro Four Thirds cameras and many smartphones.',
            '16:9 (High Definition): The international standard for HDTV, YouTube, computer monitors, and widescreen presentations.',
            '9:16 (Vertical): Inverse of 16:9, dominant for mobile-first media, TikTok, Instagram Reels, and smartphone stories.',
          ],
          callout: {
            type: 'info',
            text: 'When target dimensions do not match the source aspect ratio, you must either crop content (losing perimeter pixels) or add letterboxing. Stretches that disrupt proportions distort faces, circles, and typography.',
          },
        },
        {
          heading: '3. The CSS aspect-ratio Property',
          body: [
            'Modern CSS provides the native "aspect-ratio: 16 / 9" rule. By combining this with intrinsic width and height attributes in HTML, browsers calculate layout height before image bytes download, preventing cumulative layout shifts (CLS).',
          ],
        },
      ],
      limitations: [
        'Odd or non-standard pixel dimensions (e.g. 1919×1079) result in irreducible ratios (1919:1079) despite visually resembling 16:9. PixelProof tests for near-standard tolerances to highlight visual equivalence.',
      ],
      faq: [
        {
          question: 'Can I change an aspect ratio without cropping or stretching?',
          answer: 'No. Changing an aspect ratio without stretching either requires cropping extraneous content or padding the canvas with bars (letterboxing/pillarboxing).',
        },
      ],
    },
  },
  {
    slug: 'color-palette-extraction',
    title: 'How to Extract a Color Palette from a Photograph',
    summary: 'A deep dive into color quantization, median-cut algorithms, perceptual sorting, and alpha channel handling in digital images.',
    category: 'Color & Pigment',
    readTime: '6 min read',
    lastUpdated: 'October 2026',
    relatedToolUrl: '/tools/color-palette',
    relatedToolName: 'Color Palette Extractor',
    content: {
      introduction: 'Extracting a harmonious color palette from a photograph containing millions of distinct RGB values is a fundamental problem in computer graphics and interface design. Rather than picking random pixels, algorithms group visually significant clusters.',
      sections: [
        {
          heading: '1. The Challenge of Raw Pixel Distribution',
          body: [
            'A 12-megapixel photograph contains 12,000,000 pixels. A smooth blue sky alone may contain 40,000 distinct subtle RGB gradations. A naive frequency count would merely return dozens of nearly indistinguishable shades of sky blue while completely missing an amber sunflower in the corner.',
            'To capture the true tonal range of an image, color quantization algorithms partition color space into bounded volumetric subsets.',
          ],
        },
        {
          heading: '2. The Median Cut Algorithm',
          body: [
            'PixelProof uses a specialized implementation of Paul Heckbert\'s Median Cut algorithm. The algorithm treats every pixel as a point in 3D RGB coordinate space.',
            'It encloses all pixels within a 3D bounding box, identifies the color channel (Red, Green, or Blue) exhibiting the greatest variance, sorts pixels along that axis, and splits the box at the median. Repeating this division produces 2, 4, 8, 12, or 16 balanced buckets. The centroid of each box provides our extracted swatch.',
          ],
          callout: {
            type: 'tip',
            text: 'Transparent pixels must be filtered prior to clustering. Otherwise, transparent regions (RGB 0,0,0, Alpha 0) erroneously inject black swatches into brand logos and icon assets.',
          },
        },
        {
          heading: '3. Perceptual vs Mathematical Significance',
          body: [
            'Human eyes are non-linearly sensitive to green wavelengths and contrast gradients. The extracted palette swatches in PixelProof calculate relative area percentage and Rec. 709 luminance values to provide hex, rgb, and human-readable descriptive color names.',
          ],
        },
      ],
      limitations: [
        'Extracted swatches represent mathematical clusters of representative regions, not intentional artistic color harmonies. Designers frequently refine tints and saturations for UI contrast standards.',
      ],
      faq: [
        {
          question: 'Why does my extracted palette show 8 colors when the photo had thousands?',
          answer: 'The extractor clusters millions of subtle pixel variations into the requested number of dominant representative buckets so you have an actionable, usable color theme.',
        },
      ],
    },
  },
  {
    slug: 'reduce-image-file-size',
    title: 'How to Reduce Image File Size for the Web Without Destroying Quality',
    summary: 'The three levers of image compression: resolution scaling, format efficiency, and perceptual quality encoding.',
    category: 'Compression & Optimization',
    readTime: '5 min read',
    lastUpdated: 'October 2026',
    relatedToolUrl: '/tools/image-optimizer',
    relatedToolName: 'Image Optimizer & Exporter',
    content: {
      introduction: 'Unoptimized images remain the single largest contributor to page weight and slow Largest Contentful Paint (LCP) times on modern websites. Reducing payload size requires balancing three distinct dimensions.',
      sections: [
        {
          heading: '1. The Three Levers of Image Optimization',
          body: [
            'Lever 1: Physical Resolution. Serving a 4000px wide camera photo to a mobile card that is 400px wide wastes 99% of transmitted data. Downsampling to your maximum required display dimension produces the greatest file savings.',
            'Lever 2: Encoding Format. Modern formats like WebP and AVIF employ predictive coding and block transforms derived from video codecs (VP8 and AV1), cutting file size by 30% to 50% compared to legacy JPEG at identical visual quality.',
            'Lever 3: Compression Quality. Lossy encoders discard high-frequency data imperceptible to the human eye. Dropping quality from 100% to 80% typically halves file weight with virtually no visible difference.',
          ],
        },
        {
          heading: '2. The Quality Slider Sweet Spot',
          body: [
            'Saving at 100% quality is a misnomer; even "100%" JPEG is lossy, yet incurs a massive file penalty to encode negligible high-frequency noise.',
            'Empirical testing indicates that a quality setting between 75% and 82% represents the perceptual sweet spot for web delivery. Below 60%, blocking artifacts and color banding become noticeable.',
          ],
          callout: {
            type: 'warning',
            text: 'Re-compressing an already compressed lossy JPEG into another lossy format can cause generation loss (cumulative degradation). Always compress from the highest quality original available.',
          },
        },
      ],
      limitations: [
        'Client-side browser canvas encoding is dependent on the host browser\'s underlying graphics engine (e.g. libwebp or libjpeg-turbo). Results may vary slightly between Chromium, Firefox, and WebKit.',
      ],
      faq: [
        {
          question: 'What is the recommended target file size for web images?',
          answer: 'As a rule of thumb: Hero banners should aim for under 150 KB; standard editorial photos under 80 KB; icons and thumbnails under 20 KB.',
        },
      ],
    },
  },
  {
    slug: 'format-comparison-jpeg-png-webp-avif',
    title: 'JPEG vs PNG vs WebP vs AVIF: Which Image Format Should You Choose?',
    summary: 'A definitive engineering breakdown of compression algorithms, alpha transparency, browser support, and optimal production use cases.',
    category: 'Formats & Protocols',
    readTime: '7 min read',
    lastUpdated: 'October 2026',
    relatedToolUrl: '/tools/image-inspector',
    relatedToolName: 'Image Inspector',
    content: {
      introduction: 'Choosing the right format is an architectural decision that directly influences bandwidth, battery consumption, rendering speed, and visual fidelity.',
      sections: [
        {
          heading: '1. Detailed Format Breakdown',
          body: [
            'JPEG (Joint Photographic Experts Group): Created in 1992. Discrete Cosine Transform (DCT) based lossy compression. Superb for continuous-tone photography. Does NOT support alpha transparency.',
            'PNG (Portable Network Graphics): Created in 1996. Deflate-based lossless compression. Ideal for sharp high-contrast line art, diagrams, screenshots, and 8-bit alpha transparency. Produces large files for photography.',
            'WebP (Google): Introduced in 2010. Combines lossy and lossless algorithms with alpha transparency and animation. Supported by >97% of global browsers. Produces files 25–35% smaller than JPEG.',
            'AVIF (AV1 Image File Format): Standardized in 2019. Leverages modern AV1 intra-frame video compression. Incredible efficiency at low bitrates with HDR and 10/12-bit color support.',
          ],
        },
        {
          heading: '2. Decision Matrix: When to Use Which Format',
          body: [
            'Complex Photography for Web: WebP or AVIF as primary format, JPEG as fallback.',
            'Logos, Icons, and Interface Elements with Transparency: SVG (vector) first; PNG or WebP if raster.',
            'Photographic Master Archives: Uncompressed TIFF, RAW, or maximum quality lossless PNG.',
            'High-contrast technical screenshots: PNG or Lossless WebP to prevent mosquito noise around text.',
          ],
          callout: {
            type: 'info',
            text: 'Using the HTML5 <picture> tag with <source type="image/avif"> and <source type="image/webp"> allows modern browsers to download the smallest format while preserving universal compatibility.',
          },
        },
      ],
      limitations: [
        'Older operating systems (Windows 7/8, early macOS) or desktop graphics programs may still lack native thumbnail renderers for AVIF.',
      ],
      faq: [
        {
          question: 'Is WebP universally supported now?',
          answer: 'Yes. All modern releases of Chrome, Safari (iOS 14+ and macOS Big Sur+), Edge, and Firefox fully support WebP.',
        },
      ],
    },
  },
  {
    slug: 'why-image-metadata-missing',
    title: 'Why Image Metadata and EXIF Tags Are Frequently Missing',
    summary: 'Understand the lifecycle of EXIF, IPTC, and XMP metadata chunks, privacy scrubbing by messaging apps, and web pipeline optimization.',
    category: 'Metadata & Privacy',
    readTime: '4 min read',
    lastUpdated: 'October 2026',
    relatedToolUrl: '/tools/image-inspector',
    relatedToolName: 'Image Inspector',
    content: {
      introduction: 'Users inspecting downloaded images are often surprised to find zero camera details, GPS coordinates, or timestamps. Understanding where metadata originates and where it disappears reveals why.',
      sections: [
        {
          heading: '1. What EXIF Actually Contains',
          body: [
            'Exchangeable Image File Format (EXIF) is a standard specifying formats for camera settings, capture timestamps, shutter speed, aperture (F-stop), ISO, focal length, lens model, and sensitive GPS geolocation coordinates.',
            'When a photograph is captured by a camera or smartphone, this data is written into an APP1 marker chunk at the start of the JPEG or HEIC file.',
          ],
        },
        {
          heading: '2. The Privacy & Security Scrubbing Pipeline',
          body: [
            'Social networks and messaging platforms (including WhatsApp, Instagram, X/Twitter, Signal, and Reddit) deliberately strip all EXIF metadata upon upload. This prevents geolocation stalking and protects user privacy.',
            'Modern web build pipelines (Webpack, Vite, Sharp, ImageMagick) also strip metadata chunks during production bundling to eliminate 2 KB to 60 KB of unnecessary overhead per asset.',
          ],
          callout: {
            type: 'warning',
            text: 'A missing EXIF block does NOT mean a file is corrupt; it is standard practice across the web to strip metadata for privacy and bandwidth efficiency.',
          },
        },
      ],
      limitations: [
        'Browser-based JavaScript cannot recover metadata that was stripped or re-encoded prior to downloading the file.',
      ],
      faq: [
        {
          question: 'Should I strip EXIF metadata before posting photos publicly?',
          answer: 'Yes. Unless you are entering a photography competition where camera settings are required, stripping GPS and device metadata protects your home location and personal privacy.',
        },
      ],
    },
  },
];
