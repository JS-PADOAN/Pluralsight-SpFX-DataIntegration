export class CarvedRockLibraryLibrary {
  public name(): string {
    return 'CarvedRockLibraryLibrary';
  }

  public getCurrentTime(): string {
    return 'Current time from Carved Rock Lib is ' + new Date().toTimeString()+ " ;-)";
  }
}
