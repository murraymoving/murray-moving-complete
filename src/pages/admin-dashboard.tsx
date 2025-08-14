import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  LogOut,
  Shield,
  Phone,
  Mail,
  Calendar,
  MapPin
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to log in to access the admin panel.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: quotesData, isLoading: quotesLoading } = useQuery({
    queryKey: ["/api/admin/quotes"],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return false;
      }
      return failureCount < 3;
    },
  });

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/admin/contacts"],
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) return false;
      return failureCount < 3;
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-8 w-8 text-green-600 animate-spin" />
          <p className="mt-2 text-sm text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect will happen via useEffect
  }

  const quotes = (quotesData as any)?.quotes || [];
  const contacts = (contactsData as any)?.contacts || [];

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'secondary',
      'contacted': 'default', 
      'scheduled': 'default',
      'completed': 'default'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Murray Moving</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Murray Moving Admin</h1>
                  <p className="text-sm text-gray-500">Business Management Dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {(user as any)?.firstName || (user as any)?.email || 'Admin'}
                </span>
                <Button 
                  asChild
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 flex items-center space-x-2 mr-3"
                >
                  <Link href="/admin/leads">
                    <Users className="h-4 w-4" />
                    <span>Manage Leads</span>
                  </Link>
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Quotes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {quotesLoading ? "..." : quotes.length}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Contact Messages</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {contactsLoading ? "..." : contacts.length}
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Quotes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {quotesLoading ? "..." : quotes.filter((q: any) => q.status === 'pending').length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {quotesLoading ? "..." : quotes.filter((q: any) => {
                        const date = new Date(q.createdAt);
                        const now = new Date();
                        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Quotes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Recent Quote Requests</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quotesLoading ? (
                    <p className="text-gray-500">Loading quotes...</p>
                  ) : quotes.length === 0 ? (
                    <p className="text-gray-500">No quote requests yet.</p>
                  ) : (
                    quotes.slice(0, 5).map((quote: any) => (
                      <div key={quote.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {quote.firstName} {quote.lastName}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {quote.phone}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {quote.moveFrom} → {quote.moveTo || "Not specified"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(quote.status)}
                          <p className="text-sm text-gray-600 mt-1">
                            {quote.serviceType.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Recent Contact Messages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactsLoading ? (
                    <p className="text-gray-500">Loading contacts...</p>
                  ) : contacts.length === 0 ? (
                    <p className="text-gray-500">No contact messages yet.</p>
                  ) : (
                    contacts.slice(0, 5).map((contact: any) => (
                      <div key={contact.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center mb-1">
                          <Mail className="h-3 w-3 mr-1" />
                          {contact.email}
                        </p>
                        {contact.subject && (
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Subject: {contact.subject}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {contact.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}