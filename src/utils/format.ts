interface Item {
  name: string;
  rename?: string;
  type?: string;
  defaultVal?: any;
  children?: Item[];
  format?(tempValue?: any, tempResult?: any): any;
}

/**
 * 格式化数据
 * @param data 数据源
 * @param rules 格式化规则
 */
function formatData(data: any, rules: Item[], defaultVal?: any) {
  if (Object.prototype.toString.call(data) === '[object Object]') {
    return handleObj(data, rules, defaultVal);
  } else if (Array.isArray(data)) {
    return data.map(function(item) {
      return formatData(item, rules, defaultVal);
    });
  }
}
function handleObj(data: any, rules: Item[], defaultVal?: any) {
  const tempResult = {};
  rules.forEach(function(item) {
    let tempValue;

    if ('name' in item) {
      tempValue = data[item.name];
    } else {
      return;
    }

    if ('type' in item) {
      const translateFn = {
        string: translateStr,
        number: translateNum,
      };
      if (item.type in translateFn) {
        tempValue = translateFn[item.type](tempValue);
      }
    }

    if ('defaultVal' in item && tempValue === undefined) {
      tempValue = item.defaultVal;
    }

    if (defaultVal !== undefined) {
      tempValue = tempValue === undefined ? defaultVal : tempValue;
    }

    if ('format' in item) {
      const formatValue = item.format(tempValue, tempResult);
      tempValue = formatValue;
    } else if ('children' in item && Array.isArray(item.children)) {
      tempValue = formatData(tempValue, item.children);
    }

    if ('rename' in item) {
      tempResult[item.rename] = tempValue;
    } else {
      tempResult[item.name] = tempValue;
    }
  });
  return tempResult;
}
/**
 * 转换会数字类型
 * @param value 需要转换的值
 */
function translateNum(value: any) {
  function strToNum(value: any) {
    return isNaN(parseFloat(value)) ? 0 : parseFloat(value);
  }
  return typeof value === 'string' ? strToNum(value) : value;
}
/**
 * 转换为字符串类型
 * @param value
 * @return 转换后的字符串
 */
function translateStr(value: any) {
  return `${value}`;
}

export function lineToUpper(string: string) {
  return string.replace(/"[\w]*"\:/g, function(all) {
    return all.replace(/\_(\w)/g, function(all, letter) {
      return letter.toUpperCase();
    });
  });
}

export default formatData;
