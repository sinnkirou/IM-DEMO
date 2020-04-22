declare module '*.css';
declare module '*.png';
declare module '*.css';
declare module '*.less';
declare module '*.svg';
declare module '*.png';
declare module '*.json';

interface IRCForm {
  form: {
    validateFields: (filedNames?: any, options?: any, callback?: (errors, values) => void) => void;
    // validateFields: (fieldNames?: string[], options?: object, callback?: (errors, values) => void) => void;
    setFieldsValue: (obj: object) => void;
    getFieldProps: (
      filedName: string,
      option: {
        rules?: Array<{
          required?: boolean;
          whitespace?: boolean;
          message?: string;
          type?: string;
          pattern?: RegExp|string;
          validator?: (rule, value, callback) => void;
        }>;
        validateTrigger?: string[];
        initialValue?: string;
      },
    ) => any;
    getFieldError: (filedName: string) => string;
    getFieldValue: (filedName: string) => string;
    getFieldDecorator: (filedName: string, options?: any) => any;
  };
}

interface IAction {
  type: string;
  inherit?: boolean;
  [propsName: string]: any;
}

interface IConnectProps {
  history: any;
  location: {
    query?: any;
    pathname?: string;
  };
  match: {
    params?: any;
  };
  dispatch: (arg: IAction) => Promise<any>;
  loading: { effects: object; global: boolean; models: object };
}

interface IConnectFormProps extends IConnectProps, IRCForm {}

interface Window {
  webkitURL: any;
}

interface EventTarget {
  result: any;
}
