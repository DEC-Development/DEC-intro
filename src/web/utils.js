export function convertToTitleCase(inputString) {
    if (inputString) {
        // Split the input string by underscores
        const words = inputString.split('_');

        // Capitalize the first letter of each word
        const titleCaseWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));

        // Join the words back together with spaces
        const titleCaseString = titleCaseWords.join(' ');

        return titleCaseString;
    }
}

export function getValueByJsonPath(jsonObject, jsonPath) {
    const keys = jsonPath.split('.');
  
    function recursiveFind(obj, keys) {
      if (!obj || typeof obj !== 'object') {
        return null;
      }
  
      const currentKey = keys[0];
  
      if (keys.length === 1) {
        return obj[currentKey] !== undefined ? obj[currentKey] : null;
      } else {
        return recursiveFind(obj[currentKey], keys.slice(1));
      }
    }
  
    return recursiveFind(jsonObject, keys);
  }