/**
 * snake_case -> camelCase로 변환하는 함수
 * 예: start_date → startDate
 */
const toCamelCase = (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  };
  
  /**
   * 객체의 키를 전부 camelCase로 변환
   * 재귀적으로 내부 객체나 배열도 처리 가능
   */
  const convertKeys = (input: any): any => {
    if (Array.isArray(input)) {
      return input.map(convertKeys);
    } else if (input !== null && typeof input === "object") {
      return Object.keys(input).reduce((acc: any, key) => {
        const camelKey = toCamelCase(key);
        acc[camelKey] = convertKeys(input[key]);
        return acc;
      }, {});
    } else {
      return input;
    }
  };
  
  export default convertKeys;
  