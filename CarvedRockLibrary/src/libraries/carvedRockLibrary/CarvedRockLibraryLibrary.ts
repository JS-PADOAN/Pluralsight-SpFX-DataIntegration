export class CarvedRockLibraryLibrary {
  public name(): string {
    return 'CarvedRockLibraryLibrary';
  }

  public getCurrentTime(): string {
    return 'The current time as returned from the corporate library is ' + new Date().toTimeString();
  }
}
