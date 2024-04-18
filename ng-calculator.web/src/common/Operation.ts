export enum Operation {
  Add,
  Subtract,
  Multiply,
  Divide
}

export class OperationCharacterMap {
  private _map: { [key in Operation] : string } = {
    [Operation.Add]: '+',
    [Operation.Subtract]: '-',
    [Operation.Multiply]: '*',
    [Operation.Divide]: '%',
  }

  public map(operation: Operation) {
    return this._map[operation]
  }
}
