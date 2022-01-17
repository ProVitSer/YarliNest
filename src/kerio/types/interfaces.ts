export interface SimpleKerioData {
    jsonrpc: string,
    id: number,
    method: string,
}

export interface GetTokenRequest extends SimpleKerioData{
    params: {
        userName: string,
        password: string,
        application: {
            name: string,
            vendor: string,
            version: string,
        }
    }
}

export interface GetConferenceListRequest extends SimpleKerioData {
    params: {
        query: {
            fields: Array<string>,
            start: number,
            limit: number,
            combining: string,
            conditions?: Array<Conditions>
        },
        folderIds: Array<string>,
    }
}

export interface Conditions {
    fieldName?: string,
    comparator?: string,
    value?: string
}



export interface GetTokenResponse extends SimpleKerioData {
    token?: string,
    cookie?: string,
}

export interface GetConferenceListResponse {
       list: ConferenceList[] | [],
       totalItems: number,
}

export interface ConferenceList {
   access: string,
   summary: string,
   location: string,
   description: string,
   categories: Array<string>,
   start: string,
   end: string,
   attendees: ConferenceAttendees

}
export interface ConferenceAttendees {
   displayName: string,
   emailAddress: string,
   role: string,
   isNotified: string,
   partStatus: string,
}

export interface GetPhonebookRequest extends SimpleKerioData {
   params: {
       folderIds: Array<string>,
       query: {
           start: number,
           limit: number,
       }
   }
}

export interface GetPhonebookResponse {
    id: string,
    folderId: string,
    watermark: number,
    type: string,
    commonName: string,
    firstName: string,
    middleName: string,
    surName: string,
    titleBefore: string,
    titleAfter: string,
    nickName: string,
    phoneNumbers: Array<string>,
    emailAddresses: EmailAddressesList[],
    postalAddresses: Array<string>,
    urls: Array<string>,
    birthDay: string,
    anniversary: string,
    companyName: string,
    departmentName: string,
    profession: string,
    managerName: string,
    assistantName: string,
    comment: string,
    IMAddress: string,
    photo: { id: string, url: string,},
    categories: Array<string>
    certSourceId: string,
    isGalContact: boolean    
}

export interface EmailAddressesList {
    address:string,
    name: string, 
    preferred:boolean,
    isValidCertificate: boolean,
    type: string,
    refId: string,
    extension:{
        groupId: string,
        label: string,
    }    
}