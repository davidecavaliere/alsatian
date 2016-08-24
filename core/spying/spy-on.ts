import {
    RestorableSpy,
    PropertySpy
} from "../_spying";

export function SpyOn(target: any, functionName: string): RestorableSpy {

  if (target[functionName] instanceof Function) {
    return new RestorableSpy(target, functionName);
  }
  else {
    return new PropertySpy(target, functionName);
  }
}
