module.exports = class CustomError {
  constructor(message) {
    this.message = message;
    this.code = 'Error';
  }
};
