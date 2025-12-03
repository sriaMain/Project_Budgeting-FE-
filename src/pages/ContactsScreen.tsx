import { useState,useEffect} from "react";
import type { Client, POC } from "../pages/ClientListPage";
import {ClientListPage} from "../pages/ClientListPage";
import{ AddClientPage} from "../pages/AddClientPage";
import {ClientDetailsPage} from "../pages/ClientDetailsPage";
import { Layout } from "../components/Layout";
import axiosInstance from "../utils/axiosInstance";


export default function ContactsScreen() {
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'details'>('list');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Application State - Clients
  const [clients, setClients] = useState<Client[]>([

  ]);

  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get("/client/");
      if (response.status === 200) {
        setClients(response.data);

      }
      console.log("Fetched clients:", response.data);   
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Application State - POCs
  const [pocs, setPocs] = useState<POC[]>([
    {
      id: 1,
      company: 1,
      company_name: "ABC Solutions Pvt Ltd",
      poc_name: "Surya",
      designation: "Developer",
      poc_mobile: "7895589625",
      poc_email: "gedelasridevi02@gmail.com"
    },
    {
      id: 2,
      company: 1,
      company_name: "ABC Solutions Pvt Ltd",
      poc_name: "Devi",
      designation: "Backend Developer",
      poc_mobile: "7895589627",
      poc_email: "sridevi@sriainfotech.com"
    }
  ]);

  const handleNavigateToDetails = (clientId: number) => {
    setSelectedClientId(clientId);
    setCurrentView('details');
  };

  const handleClientCreated = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
    handleNavigateToDetails(newClient.id);
  };

  const handlePOCCreated = (newPOC: POC) => {
    setPocs(prev => [...prev, newPOC]);
  };

  const getClientById = (id: number) => clients.find(c => c.id === id);
  const getPocsByClientId = (id: number) => pocs.filter(p => p.company === id);

  return (
    <Layout userRole="admin" currentPage="contacts" onNavigate={() => {}}>
      <div className="bg-gray-50 font-sans min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          {currentView === 'list' && (
            <ClientListPage 
              clients={clients} 
              onAddClient={() => setCurrentView('add')} 
              onSelectClient={handleNavigateToDetails} 
            />
          )}

          {currentView === 'add' && (
            <AddClientPage 
              onSave={handleClientCreated} 
              onCancel={() => setCurrentView('list')}
            />
          )}

          {currentView === 'details' && selectedClientId && (
            <ClientDetailsPage 
              client={getClientById(selectedClientId)!}
              pocs={getPocsByClientId(selectedClientId)}
              onAddPOC={handlePOCCreated}
              onBack={() => setCurrentView('list')}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}