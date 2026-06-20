"use client";

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Building, 
  ClipboardList, 
  Plus, 
  Check, 
  X, 
  ArrowLeft,
  Loader2,
  Lock,
  Globe,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { db } from '@envios-ya/firebase/src/client';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';

// Define roles
type UserRole = 'super_admin' | 'admin' | 'pilot' | 'client' | 'partner';

interface PermissionItem {
  id: string;
  name: string;
  description: string;
  roles: UserRole[];
}

const PERMISSIONS: PermissionItem[] = [
  { id: 'view_all_data', name: 'Ver Todos los Datos', description: 'Acceso global a empresas, pilotos y pedidos de todo el sistema.', roles: ['super_admin'] },
  { id: 'manage_companies', name: 'Crear y Gestionar Empresas', description: 'Registrar nuevos comercios, hoteles o alianzas.', roles: ['super_admin'] },
  { id: 'manage_users', name: 'Asociar Usuarios a Empresas', description: 'Crear personal y asignarles roles específicos.', roles: ['super_admin', 'admin'] },
  { id: 'assign_pilots', name: 'Asignar Pilotos a Pedidos', description: 'Coordinar qué conductor express realizará cada entrega.', roles: ['super_admin', 'admin'] },
  { id: 'create_order', name: 'Solicitar Envíos y Mandados', description: 'Generar nuevos pedidos y programar logísticas.', roles: ['super_admin', 'admin', 'client'] },
  { id: 'manage_trip_status', name: 'Aceptar/Rechazar y Entregar Viajes', description: 'Acción operativa de pilotos en tránsito.', roles: ['pilot'] },
  { id: 'view_billing_details', name: 'Ver Detalle de Facturación', description: 'Visualizar balances, cortes mensuales y estados de cuenta.', roles: ['super_admin', 'client', 'partner'] },
  { id: 'edit_catalog', name: 'Gestionar Menús y Catálogos', description: 'Modificar productos y platos del comercio socio.', roles: ['partner'] }
];

export default function RbacDashboard() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [simulatedUserId, setSimulatedUserId] = useState('super-1');

  useEffect(() => {
    const sim = localStorage.getItem('envios_ya_sim_user');
    if (sim) {
      const parsed = JSON.parse(sim);
      setSimulatedUserId(parsed.id);
      setSelectedRole(parsed.role as UserRole);
    }
  }, []);

  // Firestore states
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyNit, setCompanyNit] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyTier, setCompanyTier] = useState<'standard' | 'premium_partner'>('standard');
  const [creatingCompany, setCreatingCompany] = useState(false);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('client');
  const [userCompanyId, setUserCompanyId] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  const [activeTab, setActiveTab] = useState<'companies' | 'users' | 'orders'>('companies');

  // Real-time subscriptions
  useEffect(() => {
    setLoading(true);

    const unsubComp = onSnapshot(collection(db, 'companies'), (snap) => {
      setCompanies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      setOrders(snap.docs.map(d => ({ orderId: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => {
      unsubComp();
      unsubUsers();
      unsubOrders();
    };
  }, []);

  // Filter orders based on the selected simulated user's role and company
  const getCurrentUserCompanyId = () => {
    if (selectedRole === 'super_admin') return 'global';
    if (selectedRole === 'pilot') return 'pilot-fleet';
    
    // Lookup selected user from list
    const foundUser = users.find(u => u.id === simulatedUserId);
    return foundUser?.companyId || 'hotel_santo_domingo';
  };

  const currentCompanyId = getCurrentUserCompanyId();

  const getFilteredOrders = () => {
    if (selectedRole === 'super_admin' || selectedRole === 'admin') {
      return orders; // Admins see everything
    }
    if (selectedRole === 'pilot') {
      // Pilots see orders they accepted or that are pending
      return orders.filter(o => o.status === 'pending' || o.driverId === simulatedUserId);
    }
    // Clients/Partners see only their company's orders
    return orders.filter(o => o.clientId === currentCompanyId);
  };

  const filteredOrdersList = getFilteredOrders();

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId.trim() || !companyName.trim()) return;

    setCreatingCompany(true);
    try {
      await setDoc(doc(db, 'companies', companyId.trim()), {
        companyId: companyId.trim(),
        name: companyName,
        nit: companyNit || 'C/F',
        address: companyAddress,
        billingEmail: companyEmail,
        pricingTier: companyTier,
        createdAt: new Date().toISOString()
      });

      setCompanyId('');
      setCompanyName('');
      setCompanyNit('');
      setCompanyAddress('');
      setCompanyEmail('');
      
      alert(`Empresa ${companyName} creada con éxito.`);
    } catch (err) {
      console.error(err);
      alert("Error al crear la empresa.");
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    setCreatingUser(true);
    try {
      const generatedId = `usr-${Date.now()}`;
      await setDoc(doc(db, 'users', generatedId), {
        name: userName,
        email: userEmail,
        role: userRole,
        companyId: userRole === 'super_admin' ? '' : userCompanyId,
        createdAt: new Date().toISOString()
      });

      setUserName('');
      setUserEmail('');
      setUserRole('client');
      setUserCompanyId('');
      
      alert(`Usuario ${userName} creado con éxito.`);
    } catch (err) {
      console.error(err);
      alert("Error al crear el usuario.");
    } finally {
      setCreatingUser(false);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      case 'admin': return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'pilot': return 'bg-orange-500/10 text-orange-400 border border-orange-500/30';
      case 'client': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'partner': return 'bg-pink-500/10 text-pink-400 border border-pink-500/30';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin (Coordinador)';
      case 'pilot': return 'Piloto (Conductor)';
      case 'client': return 'Cliente (Hotel/Airbnb)';
      case 'partner': return 'Socio (Restaurante)';
    }
  };

  // Mock list of users for switching context if db users empty
  const defaultSimUsers: { id: string; name: string; role: UserRole; companyId: string }[] = [
    { id: 'super-1', name: 'Aldo SuperAdmin', role: 'super_admin', companyId: 'global' },
    { id: 'admin-1', name: 'Carlos Dispatcher', role: 'admin', companyId: 'envios_ya_corp' },
    { id: 'pilot-1', name: 'Mario Ponce', role: 'pilot', companyId: 'pilot-fleet' },
    { id: 'client-1', name: 'Huésped Casa Santo Domingo', role: 'client', companyId: 'hotel_santo_domingo' },
    { id: 'partner-1', name: 'Gerente La Merced', role: 'partner', companyId: 'restaurante_antigua' }
  ];

  // Merge database users with mock users for role switching dropdown
  const allSwitchableUsers = [
    ...defaultSimUsers,
    ...users.map(u => ({ id: u.id, name: u.name, role: u.role as UserRole, companyId: u.companyId }))
  ];

  const currentSimUser = allSwitchableUsers.find(u => u.id === simulatedUserId) || defaultSimUsers[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:text-orange-500 transition-colors">
              <ArrowLeft size={16} />
              <span className="text-sm font-semibold">Regresar</span>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <span className="text-orange-500 font-extrabold text-lg tracking-tight">ENVIOS-YA</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-semibold text-slate-400">Control de Accesos (RBAC)</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <Shield size={16} className="text-orange-500" />
              <label className="text-[10px] font-bold text-slate-400 uppercase">Simular Usuario:</label>
              <select
                value={simulatedUserId}
                onChange={(e) => {
                  const targetId = e.target.value;
                  const found = allSwitchableUsers.find(u => u.id === targetId);
                  if (found) {
                    setSimulatedUserId(targetId);
                    setSelectedRole(found.role as UserRole);
                    localStorage.setItem('envios_ya_sim_user', JSON.stringify({
                      id: found.id,
                      name: found.name,
                      role: found.role,
                      companyId: found.companyId
                    }));
                  }
                }}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                {allSwitchableUsers.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.name} ({getRoleLabel(u.role)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Permission Matrix & Role selector info */}
        <div className="space-y-8 lg:col-span-1">
          {/* Active Sim User Profile */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sesión Simulada</span>
                <h3 className="text-lg font-bold text-white mt-1">{currentSimUser.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {currentSimUser.id}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(selectedRole)}`}>
                {getRoleLabel(selectedRole)}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-800/60 space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Asociación (Empresa ID):</span>
                <span className="font-semibold text-slate-200 font-mono">{currentSimUser.companyId || 'N/A (Acceso Global)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nivel de Restricción DB:</span>
                <span className="font-semibold text-slate-200">
                  {selectedRole === 'super_admin' ? 'Total (Todo el sistema)' :
                   selectedRole === 'admin' ? 'Coordinador (Todo el sistema)' :
                   selectedRole === 'pilot' ? 'Operador (Pendientes y propias)' : 'Filtrado por Empresa'}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Permissions Matrix */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Lock size={16} className="text-orange-500" />
              Matriz de Permisos del Rol
            </h3>
            <p className="text-xs text-slate-500">
              Lista de acciones operativas permitidas según tu rol actual. El sistema bloquea o expone información dinámicamente.
            </p>

            <div className="space-y-3.5 pt-2">
              {PERMISSIONS.map(p => {
                const isAllowed = p.roles.includes(selectedRole);
                return (
                  <div key={p.id} className="flex gap-3 items-start p-2 rounded-lg bg-slate-950/40 border border-slate-800/40">
                    <div className="mt-0.5">
                      {isAllowed ? (
                        <div className="p-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                          <Check size={14} className="stroke-[3]" />
                        </div>
                      ) : (
                        <div className="p-0.5 bg-red-500/10 text-red-400 rounded">
                          <X size={14} className="stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isAllowed ? 'text-slate-200' : 'text-slate-500 line-through'}`}>{p.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{p.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center / Right Columns: Database Views & Coordination Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Admin Forms for coordination (Only visible for Super Admin and Admin) */}
          {(selectedRole === 'super_admin' || selectedRole === 'admin') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form 1: Register Company (Super Admin only) */}
              {selectedRole === 'super_admin' ? (
                <section className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building size={16} className="text-orange-500" />
                    Registrar Nueva Empresa
                  </h3>
                  <form onSubmit={handleCreateCompany} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Empresa ID (Código)</label>
                        <input
                          type="text"
                          required
                          placeholder="hotel_santo_domingo"
                          value={companyId}
                          onChange={(e) => setCompanyId(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre Comercial</label>
                        <input
                          type="text"
                          required
                          placeholder="Casa Santo Domingo"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">NIT</label>
                        <input
                          type="text"
                          placeholder="992383-1"
                          value={companyNit}
                          onChange={(e) => setCompanyNit(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Plan Tarifa</label>
                        <select
                          value={companyTier}
                          onChange={(e: any) => setCompanyTier(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        >
                          <option value="standard">Estándar (Socio)</option>
                          <option value="premium_partner">Premium Partner (15% Desc)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Dirección Principal</label>
                      <input
                        type="text"
                        placeholder="Antigua Guatemala, Guatemala"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={creatingCompany}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 font-bold text-xs text-white transition-colors disabled:opacity-50"
                    >
                      {creatingCompany ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                      Registrar Empresa
                    </button>
                  </form>
                </section>
              ) : (
                <div className="p-5 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center text-slate-500">
                  <Lock size={20} className="mb-2" />
                  <p className="text-xs font-bold">Registro de Empresas Bloqueado</p>
                  <p className="text-[10px] mt-1">Solo un Super Administrador puede crear nuevas empresas.</p>
                </div>
              )}

              {/* Form 2: Link User to Company (Super Admin & Admin) */}
              <section className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users size={16} className="text-orange-500" />
                  Crear y Enlazar Usuario
                </h3>
                <form onSubmit={handleCreateUser} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre de Empleado</label>
                      <input
                        type="text"
                        required
                        placeholder="Juan Pérez"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Email (Login)</label>
                      <input
                        type="email"
                        required
                        placeholder="juan@hotel.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Rol del Usuario</label>
                      <select
                        value={userRole}
                        onChange={(e: any) => setUserRole(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="client">Client (Personal Hotel)</option>
                        <option value="partner">Partner (Socio Comercial)</option>
                        <option value="pilot">Pilot (Conductor PWA)</option>
                        <option value="admin">Admin (Coordinador)</option>
                        <option value="super_admin">Super Admin (Global)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Asociar Empresa</label>
                      <select
                        value={userCompanyId}
                        onChange={(e) => setUserCompanyId(e.target.value)}
                        disabled={userRole === 'super_admin'}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 disabled:opacity-30"
                      >
                        <option value="">Seleccionar empresa...</option>
                        {companies.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                        {companies.length === 0 && (
                          <option value="hotel_santo_domingo">Casa Santo Domingo (Default)</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 font-bold text-xs text-white transition-colors disabled:opacity-50"
                  >
                    {creatingUser ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                    Vincular Usuario
                  </button>
                </form>
              </section>
            </div>
          )}

          {/* Database Live View with Tabs */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-800 bg-slate-950/40">
              <button
                onClick={() => setActiveTab('companies')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${activeTab === 'companies' ? 'border-orange-500 text-white bg-slate-900/30' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Building size={14} />
                  Empresas ({companies.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${activeTab === 'users' ? 'border-orange-500 text-white bg-slate-900/30' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Users size={14} />
                  Usuarios ({users.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${activeTab === 'orders' ? 'border-orange-500 text-white bg-slate-900/30' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <ClipboardList size={14} />
                  Pedidos Filtrados ({filteredOrdersList.length})
                </div>
              </button>
            </div>

            {/* Live Data Grid */}
            <div className="p-6">
              {loading ? (
                <div className="py-20 flex flex-col justify-center items-center gap-2">
                  <Loader2 className="animate-spin text-orange-500" size={32} />
                  <p className="text-xs text-slate-500">Cargando base de datos en tiempo real...</p>
                </div>
              ) : (
                <>
                  {/* Tab 1: Companies */}
                  {activeTab === 'companies' && (
                    <div className="space-y-4">
                      <p className="text-[11px] text-slate-400">
                        Lista global de empresas registradas en Firestore. Cualquier administrador del sistema puede usarlas para enlazar personal.
                      </p>
                      {companies.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                          No hay empresas creadas. Utiliza el formulario superior para crear la primera.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 font-bold">
                                <th className="pb-2">Código ID</th>
                                <th className="pb-2">Razón Social</th>
                                <th className="pb-2">NIT</th>
                                <th className="pb-2">Email</th>
                                <th className="pb-2">Tarifa</th>
                              </tr>
                            </thead>
                            <tbody>
                              {companies.map(c => (
                                <tr key={c.id} className="border-b border-slate-800/40 text-slate-300 hover:bg-slate-800/10">
                                  <td className="py-2.5 font-mono text-[10px] text-orange-500 font-bold">{c.companyId}</td>
                                  <td className="py-2.5 font-bold text-slate-200">{c.name}</td>
                                  <td className="py-2.5">{c.nit}</td>
                                  <td className="py-2.5 text-slate-400">{c.billingEmail || 'N/A'}</td>
                                  <td className="py-2.5 text-emerald-500 font-semibold">{c.pricingTier === 'premium_partner' ? 'Premium (15% desc)' : 'Estándar'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Users */}
                  {activeTab === 'users' && (
                    <div className="space-y-4">
                      <p className="text-[11px] text-slate-400">
                        Usuarios vinculados y sus roles de acceso correspondientes. Permite simular sesiones cambiando su perfil en la parte superior derecha.
                      </p>
                      {users.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                          No hay usuarios personalizados en Firestore. Utiliza el formulario de vinculación.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 font-bold">
                                <th className="pb-2">Empleado</th>
                                <th className="pb-2">Email</th>
                                <th className="pb-2">Rol Asignado</th>
                                <th className="pb-2">Empresa Relacionada</th>
                              </tr>
                            </thead>
                            <tbody>
                              {users.map(u => (
                                <tr key={u.id} className="border-b border-slate-800/40 text-slate-300 hover:bg-slate-800/10">
                                  <td className="py-2.5 font-bold text-slate-200">{u.name}</td>
                                  <td className="py-2.5 text-slate-400">{u.email}</td>
                                  <td className="py-2.5">
                                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${getRoleBadgeColor(u.role)}`}>
                                      {getRoleLabel(u.role)}
                                    </span>
                                  </td>
                                  <td className="py-2.5 font-mono text-[10px] text-slate-400">{u.companyId || 'Global (Acceso Completo)'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: Filtered Orders */}
                  {activeTab === 'orders' && (
                    <div className="space-y-4">
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                        <p className="text-[11px] text-slate-400">
                          Pedidos expuestos por Firestore para el rol actual: <strong className="text-orange-500">{getRoleLabel(selectedRole)}</strong>
                        </p>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 font-bold text-slate-400 border border-slate-700">
                          {selectedRole === 'super_admin' || selectedRole === 'admin' ? 'Ver todo' : 'Filtrado'}
                        </span>
                      </div>

                      {filteredOrdersList.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                          No hay pedidos visibles para este rol en este momento.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredOrdersList.map(o => (
                            <div key={o.orderId} className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/60 flex justify-between items-center text-xs">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[10px] font-bold text-orange-500">{o.orderId}</span>
                                  <span className="font-bold text-slate-200">{o.cargo?.description}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                                  <p><span className="font-semibold text-slate-600">Cliente (Empresa ID):</span> <span className="font-mono text-slate-400">{o.clientId}</span></p>
                                  <p><span className="font-semibold text-slate-600">Destino:</span> {o.destination?.address}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700`}>
                                  {o.status}
                                </span>
                                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                                  {o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
