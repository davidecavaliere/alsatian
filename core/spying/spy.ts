import { SpyCall } from "./spy-call";

export class Spy {

  private _originalFunction: (...args: Array<any>) => any;
  private _returnValue: any;
  private _hasReturnValue: boolean;
  private _isStubbed: boolean;
  private _originalContext: any;

  private _calls: Array<SpyCall> = [];
  public get calls() {
    return this._calls;
  }

  public constructor(originalFunction: (...args: Array<any>) => any, originalContext: any) {
    this._originalFunction = originalFunction;
    this._originalContext = originalContext;
  }

  public call(args: Array<any>) {

    this.calls.push(new SpyCall(args));

    let returnValue: any;

    if (!this._isStubbed) {
      returnValue = this._originalFunction.apply(this._originalContext, args);
    }

    if (this._hasReturnValue) {
      return this._returnValue;
    }

    return returnValue;
  }

  public return(returnValue: any) {
    this._returnValue = returnValue;
    this._hasReturnValue = true;
  }

  public andCallThrough() {
    this._isStubbed = false;
  }

  public andStub() {
    this._isStubbed = true;
  }

}
