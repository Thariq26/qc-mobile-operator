import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Compresses and resizes shop floor defect photos before uploading to server.
 * Targets < 1MB file size with maximum width of 1280px while maintaining clarity.
 *
 * @param {string} uri - Local file URI of the image
 * @returns {Promise<{ uri: string, width: number, height: number }>}
 */
export const compressImage = async (uri) => {
  if (!uri) return null;

  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: 1280,
          },
        },
      ],
      {
        compress: 0.75,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: manipResult.uri,
      width: manipResult.width,
      height: manipResult.height,
    };
  } catch (error) {
    console.warn('Image compression fail-safe engaged, using original image URI:', error?.message);
    return {
      uri,
      width: 1280,
      height: 960,
    };
  }
};

export default compressImage;
