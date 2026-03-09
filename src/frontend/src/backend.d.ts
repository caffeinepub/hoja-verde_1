import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Prospect {
    id: string;
    status: ProspectStatus;
    name: string;
    serviceRequested: string;
    address: string;
    phone: string;
    quoteDate: Time;
}
export type Time = bigint;
export interface Garden {
    id: string;
    specialObservations: string;
    clientId: string;
    avgWorkTime: bigint;
    grassType: string;
    sizeM2: number;
    maintenanceFrequency: string;
    requiredTools: string;
    terrainType: string;
}
export interface Invoice {
    id: string;
    clientId: string;
    invoiceDate: Time;
    totalAmount: number;
    servicesPerformed: string;
    nextMaintenanceDate: Time;
}
export interface MaintenanceSchedule {
    id: string;
    clientId: string;
    gardenId: string;
    isActive: boolean;
    frequency: string;
    nextDate: string;
}
export interface BusinessStats {
    quotesSentCount: bigint;
    activeClientsCount: bigint;
    quotesAcceptedCount: bigint;
    totalJobsThisMonth: bigint;
}
export interface Transaction {
    id: string;
    transactionDate: Time;
    transactionType: TransactionType;
    description: string;
    amount: number;
}
export interface JobEntry {
    id: string;
    startTime: string;
    status: JobStatus;
    clientId: string;
    endTime: string;
    scheduledDate: string;
    assignedWorker: string;
    serviceDescription: string;
}
export interface Quote {
    id: string;
    status: QuoteStatus;
    clientId: string;
    serviceDescription: string;
    creationDate: Time;
    expirationDate: Time;
    price: number;
}
export interface Client {
    id: string;
    fullName: string;
    isActive: boolean;
    gpsLocation?: string;
    address: string;
    notes: string;
    phone: string;
    registrationDate: Time;
}
export interface UserProfile {
    name: string;
}
export enum JobStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress"
}
export enum ProspectStatus {
    quoteSent = "quoteSent",
    pending = "pending",
    rejected = "rejected",
    accepted = "accepted"
}
export enum QuoteStatus {
    pending = "pending",
    sent = "sent",
    rejected = "rejected",
    accepted = "accepted"
}
export enum TransactionType {
    expense = "expense",
    income = "income"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addClient(client: Client): Promise<void>;
    addGarden(garden: Garden): Promise<void>;
    addInvoice(invoice: Invoice): Promise<void>;
    addJob(job: JobEntry): Promise<void>;
    addMaintenanceSchedule(schedule: MaintenanceSchedule): Promise<void>;
    addProspect(prospect: Prospect): Promise<void>;
    addQuote(quote: Quote): Promise<void>;
    addTransaction(transaction: Transaction): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    convertProspectToClient(prospectId: string, clientId: string): Promise<void>;
    deleteClient(id: string): Promise<void>;
    deleteGarden(id: string): Promise<void>;
    deleteInvoice(id: string): Promise<void>;
    deleteJob(id: string): Promise<void>;
    deleteMaintenanceSchedule(id: string): Promise<void>;
    deleteProspect(id: string): Promise<void>;
    deleteQuote(id: string): Promise<void>;
    deleteTransaction(id: string): Promise<void>;
    getAllClients(): Promise<Array<Client>>;
    getAllGardens(): Promise<Array<Garden>>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getAllJobs(): Promise<Array<JobEntry>>;
    getAllMaintenanceSchedules(): Promise<Array<MaintenanceSchedule>>;
    getAllProspects(): Promise<Array<Prospect>>;
    getAllQuotes(): Promise<Array<Quote>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getBusinessStats(): Promise<BusinessStats>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClient(id: string): Promise<Client>;
    getGarden(id: string): Promise<Garden>;
    getInvoice(id: string): Promise<Invoice>;
    getJob(id: string): Promise<JobEntry>;
    getJobsByClient(clientId: string): Promise<Array<JobEntry>>;
    getJobsByDate(date: string): Promise<Array<JobEntry>>;
    getMaintenanceSchedule(id: string): Promise<MaintenanceSchedule>;
    getProspect(id: string): Promise<Prospect>;
    getQuote(id: string): Promise<Quote>;
    getTransaction(id: string): Promise<Transaction>;
    getTransactionsByMonthYear(_month: bigint, _year: bigint): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateClient(client: Client): Promise<void>;
    updateGarden(garden: Garden): Promise<void>;
    updateInvoice(invoice: Invoice): Promise<void>;
    updateJob(job: JobEntry): Promise<void>;
    updateMaintenanceSchedule(schedule: MaintenanceSchedule): Promise<void>;
    updateProspect(prospect: Prospect): Promise<void>;
    updateQuote(quote: Quote): Promise<void>;
    updateTransaction(transaction: Transaction): Promise<void>;
}
