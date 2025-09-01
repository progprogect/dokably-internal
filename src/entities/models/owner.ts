export class Owner {
  private _deleted: boolean;
  private _email: string;
  private _id: string;
  private _name: string | null;

  constructor(
    deleted: boolean,
    email: string,
    id: string,
    name: string | null
  ) {
    this._deleted = deleted;
    this._email = email;
    this._id = id;
    this._name = name;
  }

  get deleted(): boolean {
    return this._deleted;
  }

  setDeleted(deleted: boolean): Owner {
    this._deleted = deleted;
    return this;
  }

  get email(): string {
    return this._email;
  }

  setEmail(email: string): Owner {
    this._email = email;
    return this;
  }

  get id(): string {
    return this._id;
  }

  setId(id: string): Owner {
    this._id = id;
    return this;
  }

  get name(): string | null {
    return this._name;
  }

  setName(name: string | null): Owner {
    this._name = name;
    return this;
  }
}
