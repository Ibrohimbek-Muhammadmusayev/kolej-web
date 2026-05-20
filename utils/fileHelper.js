const fs = require('fs');
const path = require('path');

/**
 * Safely deletes a file from the disk.
 * @param {string} relativePath - The path relative to the project root (e.g., '/uploads/file.jpg')
 */
const deleteFile = (relativePath) => {
    if (!relativePath) return;

    // Remove leading slash if present to avoid path issues
    const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    const absolutePath = path.join(__dirname, '..', cleanPath);

    try {
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            // console.log(`Deleted file: ${absolutePath}`);
        }
    } catch (error) {
        console.error(`Error deleting file: ${absolutePath}`, error);
    }
};

module.exports = {
    deleteFile
};
