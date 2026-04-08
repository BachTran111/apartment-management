class OK {
  constructor({ message = "Success", metadata = null } = {}) {
    this.status = "OK";
    this.message = message;
    if (metadata !== null) this.metadata = metadata;
  }
}

export { OK };
