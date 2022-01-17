export interface DBConference {
    id?: string,
    theme: string,
    organizer: string,
    fioOrganizer: string,
    info: string,
    date: string,
    hour: string,
    minute: string,
    duration: number,
    emailNumberArray: Array<string>,
    fio: Array<string>,
  }