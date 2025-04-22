
export interface ModelAdapter {
  modelName: string;
  buildRequest(input: any, config: object): object;
  parseResponse(response: any): object;
  validateConfig(config: object): boolean;
}
