import Text "mo:core/Text";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Business entity types
  module Client {
    public func compare(client1 : Client, client2 : Client) : Order.Order {
      Text.compare(client1.fullName, client2.fullName);
    };
  };

  public type Client = {
    id : Text;
    fullName : Text;
    phone : Text;
    address : Text;
    gpsLocation : ?Text;
    notes : Text;
    registrationDate : Time.Time;
    isActive : Bool;
  };

  public type Garden = {
    id : Text;
    clientId : Text;
    sizeM2 : Float;
    grassType : Text;
    terrainType : Text;
    requiredTools : Text;
    avgWorkTime : Int;
    maintenanceFrequency : Text;
    specialObservations : Text;
  };

  public type JobStatus = {
    #pending;
    #inProgress;
    #completed;
    #cancelled;
  };

  public type JobEntry = {
    id : Text;
    clientId : Text;
    serviceDescription : Text;
    assignedWorker : Text;
    scheduledDate : Text;
    startTime : Text;
    endTime : Text;
    status : JobStatus;
  };

  public type MaintenanceSchedule = {
    id : Text;
    clientId : Text;
    gardenId : Text;
    frequency : Text;
    nextDate : Text;
    isActive : Bool;
  };

  public type QuoteStatus = {
    #pending;
    #sent;
    #accepted;
    #rejected;
  };

  public type Quote = {
    id : Text;
    clientId : Text;
    serviceDescription : Text;
    price : Float;
    creationDate : Time.Time;
    expirationDate : Time.Time;
    status : QuoteStatus;
  };

  public type ProspectStatus = {
    #pending;
    #quoteSent;
    #accepted;
    #rejected;
  };

  public type Prospect = {
    id : Text;
    name : Text;
    phone : Text;
    address : Text;
    serviceRequested : Text;
    quoteDate : Time.Time;
    status : ProspectStatus;
  };

  public type Invoice = {
    id : Text;
    clientId : Text;
    invoiceDate : Time.Time;
    servicesPerformed : Text;
    totalAmount : Float;
    nextMaintenanceDate : Time.Time;
  };

  public type TransactionType = {
    #income;
    #expense;
  };

  public type Transaction = {
    id : Text;
    transactionType : TransactionType;
    description : Text;
    amount : Float;
    transactionDate : Time.Time;
  };

  // Data storage
  let clients = Map.empty<Text, Client>();
  let gardens = Map.empty<Text, Garden>();
  let jobs = Map.empty<Text, JobEntry>();
  let maintenanceSchedules = Map.empty<Text, MaintenanceSchedule>();
  let quotes = Map.empty<Text, Quote>();
  let prospects = Map.empty<Text, Prospect>();
  let invoices = Map.empty<Text, Invoice>();
  let transactions = Map.empty<Text, Transaction>();

  // Client CRUD operations - Admin only for modifications, users can read
  public shared ({ caller }) func addClient(client : Client) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add clients");
    };
    clients.add(client.id, client);
  };

  public query ({ caller }) func getClient(id : Text) : async Client {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };
    switch (clients.get(id)) {
      case (null) { Runtime.trap("Client not found") };
      case (?client) { client };
    };
  };

  public query ({ caller }) func getAllClients() : async [Client] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };
    clients.values().toArray().sort();
  };

  public shared ({ caller }) func updateClient(client : Client) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update clients");
    };
    clients.add(client.id, client);
  };

  public shared ({ caller }) func deleteClient(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete clients");
    };
    clients.remove(id);
  };

  // Garden CRUD operations - Admin only for modifications, users can read
  public shared ({ caller }) func addGarden(garden : Garden) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add gardens");
    };
    gardens.add(garden.id, garden);
  };

  public query ({ caller }) func getGarden(id : Text) : async Garden {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view gardens");
    };
    switch (gardens.get(id)) {
      case (null) { Runtime.trap("Garden not found") };
      case (?garden) { garden };
    };
  };

  public query ({ caller }) func getAllGardens() : async [Garden] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view gardens");
    };
    gardens.values().toArray();
  };

  public shared ({ caller }) func updateGarden(garden : Garden) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update gardens");
    };
    gardens.add(garden.id, garden);
  };

  public shared ({ caller }) func deleteGarden(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete gardens");
    };
    gardens.remove(id);
  };

  // Job CRUD operations - Admin only for modifications, users can read
  public shared ({ caller }) func addJob(job : JobEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add jobs");
    };
    jobs.add(job.id, job);
  };

  public query ({ caller }) func getJob(id : Text) : async JobEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view jobs");
    };
    switch (jobs.get(id)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) { job };
    };
  };

  public query ({ caller }) func getAllJobs() : async [JobEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view jobs");
    };
    jobs.values().toArray();
  };

  public shared ({ caller }) func updateJob(job : JobEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update jobs");
    };
    jobs.add(job.id, job);
  };

  public shared ({ caller }) func deleteJob(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete jobs");
    };
    jobs.remove(id);
  };

  // MaintenanceSchedule CRUD operations - Admin only for modifications, users can read
  public shared ({ caller }) func addMaintenanceSchedule(schedule : MaintenanceSchedule) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add maintenance schedules");
    };
    maintenanceSchedules.add(schedule.id, schedule);
  };

  public query ({ caller }) func getMaintenanceSchedule(id : Text) : async MaintenanceSchedule {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view maintenance schedules");
    };
    switch (maintenanceSchedules.get(id)) {
      case (null) { Runtime.trap("Maintenance schedule not found") };
      case (?schedule) { schedule };
    };
  };

  public query ({ caller }) func getAllMaintenanceSchedules() : async [MaintenanceSchedule] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view maintenance schedules");
    };
    maintenanceSchedules.values().toArray();
  };

  public shared ({ caller }) func updateMaintenanceSchedule(schedule : MaintenanceSchedule) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update maintenance schedules");
    };
    maintenanceSchedules.add(schedule.id, schedule);
  };

  public shared ({ caller }) func deleteMaintenanceSchedule(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete maintenance schedules");
    };
    maintenanceSchedules.remove(id);
  };

  // Quote CRUD operations - Admin only for modifications, users can read
  public shared ({ caller }) func addQuote(quote : Quote) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add quotes");
    };
    quotes.add(quote.id, quote);
  };

  public query ({ caller }) func getQuote(id : Text) : async Quote {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view quotes");
    };
    switch (quotes.get(id)) {
      case (null) { Runtime.trap("Quote not found") };
      case (?quote) { quote };
    };
  };

  public query ({ caller }) func getAllQuotes() : async [Quote] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view quotes");
    };
    quotes.values().toArray();
  };

  public shared ({ caller }) func updateQuote(quote : Quote) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update quotes");
    };
    quotes.add(quote.id, quote);
  };

  public shared ({ caller }) func deleteQuote(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete quotes");
    };
    quotes.remove(id);
  };

  // Prospect CRUD operations - Admin only for modifications, users can read
  public shared ({ caller }) func addProspect(prospect : Prospect) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add prospects");
    };
    prospects.add(prospect.id, prospect);
  };

  public query ({ caller }) func getProspect(id : Text) : async Prospect {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view prospects");
    };
    switch (prospects.get(id)) {
      case (null) { Runtime.trap("Prospect not found") };
      case (?prospect) { prospect };
    };
  };

  public query ({ caller }) func getAllProspects() : async [Prospect] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view prospects");
    };
    prospects.values().toArray();
  };

  public shared ({ caller }) func updateProspect(prospect : Prospect) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update prospects");
    };
    prospects.add(prospect.id, prospect);
  };

  public shared ({ caller }) func deleteProspect(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete prospects");
    };
    prospects.remove(id);
  };

  // Invoice CRUD operations - Admin only for modifications, users can read
  public shared ({ caller }) func addInvoice(invoice : Invoice) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add invoices");
    };
    invoices.add(invoice.id, invoice);
  };

  public query ({ caller }) func getInvoice(id : Text) : async Invoice {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) { invoice };
    };
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    invoices.values().toArray();
  };

  public shared ({ caller }) func updateInvoice(invoice : Invoice) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update invoices");
    };
    invoices.add(invoice.id, invoice);
  };

  public shared ({ caller }) func deleteInvoice(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete invoices");
    };
    invoices.remove(id);
  };

  // Transaction CRUD operations - Admin only for modifications, users can read
  public shared ({ caller }) func addTransaction(transaction : Transaction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add transactions");
    };
    transactions.add(transaction.id, transaction);
  };

  public query ({ caller }) func getTransaction(id : Text) : async Transaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    switch (transactions.get(id)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?transaction) { transaction };
    };
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    transactions.values().toArray();
  };

  public shared ({ caller }) func updateTransaction(transaction : Transaction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update transactions");
    };
    transactions.add(transaction.id, transaction);
  };

  public shared ({ caller }) func deleteTransaction(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete transactions");
    };
    transactions.remove(id);
  };

  // Business operations - Admin only
  public shared ({ caller }) func convertProspectToClient(prospectId : Text, clientId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can convert prospects to clients");
    };
    switch (prospects.get(prospectId)) {
      case (null) { Runtime.trap("Prospect not found") };
      case (?prospect) {
        let newClient : Client = {
          id = clientId;
          fullName = prospect.name;
          phone = prospect.phone;
          address = prospect.address;
          gpsLocation = null;
          notes = "";
          registrationDate = Time.now();
          isActive = true;
        };
        clients.add(clientId, newClient);
        prospects.remove(prospectId);
      };
    };
  };

  // Query operations - Users can read
  public query ({ caller }) func getJobsByDate(date : Text) : async [JobEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view jobs");
    };
    jobs.values().toArray().filter(
      func(job) { job.scheduledDate == date }
    );
  };

  public query ({ caller }) func getJobsByClient(clientId : Text) : async [JobEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view jobs");
    };
    jobs.values().toArray().filter(
      func(job) { job.clientId == clientId }
    );
  };

  public query ({ caller }) func getTransactionsByMonthYear(_month : Int, _year : Int) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    // Placeholder implementation, actual date filtering should be handled in the frontend
    transactions.values().toArray();
  };

  public type BusinessStats = {
    totalJobsThisMonth : Nat;
    activeClientsCount : Nat;
    quotesSentCount : Nat;
    quotesAcceptedCount : Nat;
  };

  public query ({ caller }) func getBusinessStats() : async BusinessStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view business stats");
    };
    
    let activeClients = clients.values().toArray().filter(
      func(client) { client.isActive }
    ).size();
    
    let quotesSent = quotes.values().toArray().filter(
      func(quote) { 
        switch (quote.status) {
          case (#sent) { true };
          case (#accepted) { true };
          case (#rejected) { true };
          case (_) { false };
        }
      }
    ).size();
    
    let quotesAccepted = quotes.values().toArray().filter(
      func(quote) { 
        switch (quote.status) {
          case (#accepted) { true };
          case (_) { false };
        }
      }
    ).size();
    
    {
      totalJobsThisMonth = jobs.size();
      activeClientsCount = activeClients;
      quotesSentCount = quotesSent;
      quotesAcceptedCount = quotesAccepted;
    }
  };
};
