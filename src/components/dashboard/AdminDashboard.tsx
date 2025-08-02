
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BookOpen, Building, TrendingUp, Database, HardDrive, Activity, BarChart3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { user, userProfile } = useAuth();
  const [allProjects, setAllProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [departmentStats, setDepartmentStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    email: '',
    role: '',
    department: ''
  });

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      // Fetch all projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*');

      // Fetch all users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*');

      setAllProjects(projectsData || []);
      setAllUsers(usersData || []);

      // Calculate department statistics
      const deptStats: any = {};
      usersData?.forEach((user: any) => {
        if (!deptStats[user.department]) {
          deptStats[user.department] = {
            students: 0,
            guides: 0,
            hods: 0,
            projects: 0
          };
        }
        
        if (user.role === 'student') deptStats[user.department].students++;
        else if (user.role === 'guide') deptStats[user.department].guides++;
        else if (user.role === 'hod') deptStats[user.department].hods++;
      });

      projectsData?.forEach((project: any) => {
        if (deptStats[project.department]) {
          deptStats[project.department].projects++;
        }
      });

      setDepartmentStats(deptStats);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.role || !newUser.department) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // This would typically be handled by an admin function
      toast({
        title: "Info",
        description: "User creation would be handled by admin functions",
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const getSystemStats = () => {
    const totalUsers = allUsers.length;
    const totalProjects = allProjects.length;
    const activeProjects = allProjects.filter((p: any) => p.status === 'active').length;
    const totalDepartments = Object.keys(departmentStats).length;
    
    return { totalUsers, totalProjects, activeProjects, totalDepartments };
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const stats = getSystemStats();

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System administration and management</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Backup System</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Maintenance</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-700">{stats.totalUsers}</p>
                <p className="text-sm text-blue-600">Total Users</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-700">{stats.totalProjects}</p>
                <p className="text-sm text-green-600">Total Projects</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-700">{stats.totalDepartments}</p>
                <p className="text-sm text-purple-600">Departments</p>
              </div>
              <Building className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-700">{stats.activeProjects}</p>
                <p className="text-sm text-orange-600">Active Users</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-teal-700">99.9%</p>
                <p className="text-sm text-teal-600">Uptime</p>
              </div>
              <TrendingUp className="h-8 w-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-700">0 MB</p>
                <p className="text-sm text-gray-600">Storage Used</p>
              </div>
              <HardDrive className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Overview Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Department Overview</CardTitle>
            <CardDescription>Real user distribution across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-center space-x-4">
              {Object.entries(departmentStats).map(([dept, stats]: [string, any]) => (
                <div key={dept} className="flex flex-col items-center">
                  <div 
                    className="bg-teal-500 w-12 mb-2 rounded-t"
                    style={{ height: `${Math.max(stats.students + stats.guides + stats.hods, 1) * 20}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 transform -rotate-45 mt-2">
                    {dept}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle>System Usage Trends</CardTitle>
            <CardDescription>Activity metrics will be tracked automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <BarChart3 className="h-16 w-16 text-gray-300" />
              <p className="text-gray-500 ml-4">Usage data will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="user-management" className="space-y-4">
        <TabsList>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="system-settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="user-management" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create New User */}
            <Card>
              <CardHeader>
                <CardTitle>Create New User</CardTitle>
                <CardDescription>Add new users to the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    placeholder="user@university.edu"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="hod">HOD</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={newUser.department} onValueChange={(value) => setNewUser({...newUser, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateUser} className="w-full">
                  Create User
                </Button>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Recently registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allUsers.slice(0, 5).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">{user.department}</p>
                      </div>
                      <Badge variant="outline" className={
                        user.role === 'student' ? 'bg-blue-50 text-blue-700' :
                        user.role === 'guide' ? 'bg-green-50 text-green-700' :
                        user.role === 'hod' ? 'bg-purple-50 text-purple-700' :
                        'bg-red-50 text-red-700'
                      }>
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(departmentStats).map(([dept, stats]: [string, any]) => (
              <Card key={dept}>
                <CardHeader>
                  <CardTitle className="text-xl">{dept}</CardTitle>
                  <CardDescription>Department Statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.students}</div>
                      <div className="text-sm text-muted-foreground">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.guides}</div>
                      <div className="text-sm text-muted-foreground">Guides</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats.hods}</div>
                      <div className="text-sm text-muted-foreground">HODs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.projects}</div>
                      <div className="text-sm text-muted-foreground">Projects</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System settings panel would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
