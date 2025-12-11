import { useState, useEffect } from "react";
import type { Client, POC } from "../pages/ClientListPage";
import { ClientListPage } from "../pages/ClientListPage";
import { AddClientPage } from "../pages/AddClientPage";
import { ClientDetailsPage } from "../pages/ClientDetailsPage";
import { Layout } from "../components/Layout";
import axiosInstance from "../utils/axiosInstance";


export default function ContactsScreen() {
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'details' | 'edit'>('list');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Application State - Clients
  const [clients, setClients] = useState<Client[]>([]);

  // Application State - POCs (populated from API)
  const [pocs, setPocs] = useState<POC[]>([]);

  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get("/client/pocs/");
      if (response.status === 200) {
        const clientsData = response.data;
        setClients(clientsData);

        // Extract and flatten all POCs from all clients
        const allPocs: POC[] = [];
        clientsData.forEach((client: any) => {
          if (client.pocs && Array.isArray(client.pocs)) {
            client.pocs.forEach((poc: any) => {
              allPocs.push({
                id: poc.id,
                company: client.id,
                company_name: client.company_name,
                poc_name: poc.poc_name,
                designation: poc.designation,
                poc_mobile: poc.poc_mobile,
                poc_email: poc.poc_email
              });
            });
          }
        });
        setPocs(allPocs);
      }
      console.log("Fetched clients:", response.data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleNavigateToDetails = (clientId: number) => {
    setSelectedClientId(clientId);
    setCurrentView('details');
  };

  const handleClientCreated = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
    handleNavigateToDetails(newClient.id);
  };

  const handleClientUpdated = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    handleNavigateToDetails(updatedClient.id);
  };

  const handleEditClient = (clientId: number) => {
    setSelectedClientId(clientId);
    setCurrentView('edit');
  };

  const handlePOCCreated = (newPOC: POC) => {
    setPocs(prev => [...prev, newPOC]);
  };

  const getClientById = (id: number) => clients.find(c => c.id === id);
  const getPocsByClientId = (id: number) => pocs.filter(p => p.company === id);

  return (
    <Layout userRole="admin" currentPage="contacts" onNavigate={() => { }}>
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

          {currentView === 'edit' && selectedClientId && (
            <AddClientPage
              client={getClientById(selectedClientId)}
              onSave={handleClientUpdated}
              onCancel={() => setCurrentView('details')}
            />
          )}

          {currentView === 'details' && selectedClientId && (
            <ClientDetailsPage
              client={getClientById(selectedClientId)!}
              pocs={getPocsByClientId(selectedClientId)}
              onAddPOC={handlePOCCreated}
              onEdit={() => handleEditClient(selectedClientId)}
              onBack={() => setCurrentView('list')}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}