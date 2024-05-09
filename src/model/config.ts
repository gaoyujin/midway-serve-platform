export class ServeEntity {
  key: string;
  description: string;
  timeout: number;
  url: string;
  middleware: MiddlewareEntity[];
  filter: [];
  controller: ControllerEntity[];
}

export class ControllerEntity {
  id: string;
  description: string;
  method: string;
  path: string;
  consumes: string[];
  parameters: string[];
  responsesMode: string;
  responses: [];
  middleware: MiddlewareEntity[];
  filter: [];
}

export class MiddlewareEntity {
  name: string;
  replaceRepose: boolean;
  sequence: number;
}
