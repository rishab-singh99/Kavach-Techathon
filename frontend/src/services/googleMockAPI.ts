// Mock Google People API for importing contacts
// In production, this would use the real Google People API with OAuth2

export interface GoogleContact {
    resourceName: string;
    name: string;
    phone: string;
    email?: string;
    photo?: string;
    organization?: string;
}

// Simulated Google contacts
const MOCK_GOOGLE_CONTACTS: GoogleContact[] = [
    { resourceName: 'people/1', name: 'Arun Sharma', phone: '9876543001', email: 'arun.sharma@gmail.com', photo: '👨', organization: 'Google India' },
    { resourceName: 'people/2', name: 'Priya Patel', phone: '9876543002', email: 'priya.patel@gmail.com', photo: '👩', organization: 'Infosys' },
    { resourceName: 'people/3', name: 'Rahul Verma', phone: '9876543003', email: 'rahul.v@gmail.com', photo: '👨‍💼' },
    { resourceName: 'people/4', name: 'Anita Singh', phone: '9876543004', email: 'anita.s@gmail.com', photo: '👩‍💼', organization: 'TCS' },
    { resourceName: 'people/5', name: 'Vikram Joshi', phone: '9876543005', photo: '👨‍🔧' },
    { resourceName: 'people/6', name: 'Sneha Gupta', phone: '9876543006', email: 'sneha.g@gmail.com', photo: '👩‍🎓', organization: 'IIT Delhi' },
    { resourceName: 'people/7', name: 'Deepak Kumar', phone: '9876543007', email: 'deepak.k@gmail.com', photo: '👨‍🏫' },
    { resourceName: 'people/8', name: 'Meera Reddy', phone: '9876543008', email: 'meera.r@gmail.com', photo: '👩‍⚕️', organization: 'Apollo Hospital' },
    { resourceName: 'people/9', name: 'Sanjay Mishra', phone: '9876543009', photo: '👨‍🍳' },
    { resourceName: 'people/10', name: 'Kavita Nair', phone: '9876543010', email: 'kavita.n@gmail.com', photo: '👩‍🔬', organization: 'ISRO' },
    { resourceName: 'people/11', name: 'SBI Customer Care', phone: '1800111210', photo: '🏦', organization: 'State Bank of India' },
    { resourceName: 'people/12', name: 'HDFC Helpline', phone: '18002026161', photo: '🏦', organization: 'HDFC Bank' },
];

// Simulate OAuth2 flow
export const googleAuthAPI = {
    // Simulate Google Sign-In
    signIn: (): Promise<{ success: boolean; user: { name: string; email: string; avatar: string } }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    user: {
                        name: 'Rauneet Singh',
                        email: 'rauneet@gmail.com',
                        avatar: '🧑‍💻',
                    },
                });
            }, 1500); // Simulate OAuth delay
        });
    },

    // Simulate Google Sign-Out
    signOut: (): Promise<{ success: boolean }> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true }), 500);
        });
    },
};

// Google People API Mock
export const googlePeopleAPI = {
    // Get all contacts
    getContacts: (): Promise<{ contacts: GoogleContact[]; total: number }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    contacts: MOCK_GOOGLE_CONTACTS,
                    total: MOCK_GOOGLE_CONTACTS.length,
                });
            }, 2000); // Simulate API call delay
        });
    },

    // Search contacts by name or phone
    searchContacts: (query: string): Promise<{ contacts: GoogleContact[] }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const results = MOCK_GOOGLE_CONTACTS.filter(
                    (c) =>
                        c.name.toLowerCase().includes(query.toLowerCase()) ||
                        c.phone.includes(query) ||
                        (c.email && c.email.toLowerCase().includes(query.toLowerCase()))
                );
                resolve({ contacts: results });
            }, 800);
        });
    },

    // Import selected contacts as trusted contacts
    importAsTrusted: (
        resourceNames: string[]
    ): Promise<{
        imported: number;
        contacts: { name: string; phone: string; icon: string }[];
    }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const imported = MOCK_GOOGLE_CONTACTS.filter((c) =>
                    resourceNames.includes(c.resourceName)
                ).map((c) => ({
                    name: c.name,
                    phone: c.phone,
                    icon: c.photo || '👤',
                }));
                resolve({ imported: imported.length, contacts: imported });
            }, 1200);
        });
    },
};

export default { googleAuthAPI, googlePeopleAPI };
