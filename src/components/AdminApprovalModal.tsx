import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types/auth';
import { X, CheckCircle2, UserX, ShieldCheck, Phone, Trash2, RotateCw, Users, AlertCircle } from 'lucide-react';
import { formatDateBn, toBengaliNumber } from '../utils/formatters';

interface AdminApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserApproved?: () => void;
}

export const AdminApprovalModal: React.FC<AdminApprovalModalProps> = ({
  isOpen,
  onClose,
  onUserApproved,
}) => {
  const { token, user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pendingUsers = users.filter((u) => u.status === 'pending');
  const approvedUsers = users.filter((u) => u.status !== 'pending');

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setActionMsg('অ্যাকাউন্ট সফলভাবে অনুমোদন করা হয়েছে!');
        setTimeout(() => setActionMsg(''), 3000);
        fetchUsers();
        if (onUserApproved) onUserApproved();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/toggle-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteOrReject = async (userId: string, action: 'delete' | 'reject') => {
    if (!confirm('আপনি কি নিশ্চিত এই অ্যাকাউন্টটি মুছে বা বাতিল করতে চান?')) return;

    try {
      const res = await fetch('/api/admin/reject-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, action }),
      });

      if (res.ok) {
        setActionMsg('অ্যাকাউন্টটি তালিকা থেকে সরানো হয়েছে।');
        setTimeout(() => setActionMsg(''), 3000);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0 bg-teal-800 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-700 flex items-center justify-center text-teal-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">অ্যাডমিন অনুমোদন প্যানেল</h3>
              <p className="text-[11px] text-teal-200">ইউজার ভেরিফিকেশন ও এক্সেস কন্ট্রোল</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              className="w-8 h-8 rounded-full bg-teal-700 hover:bg-teal-600 flex items-center justify-center text-teal-100"
              title="রিফ্রেশ"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-teal-700 hover:bg-teal-600 flex items-center justify-center text-teal-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-2 flex gap-2 border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <span>অনুমোদনের অপেক্ষায়</span>
            {pendingUsers.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-extrabold">
                {toBengaliNumber(pendingUsers.length)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>সকল ব্যবহারকারী ({toBengaliNumber(users.length)})</span>
          </button>
        </div>

        {/* Success Alert */}
        {actionMsg && (
          <div className="mx-5 mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* List Body */}
        <div className="p-5 overflow-y-auto space-y-3">
          {activeTab === 'pending' ? (
            pendingUsers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-bold text-sm text-slate-700">কোনো অপেক্ষমান আবেদন নেই</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  সব ব্যবহারকারীকে অনুমোদন দেওয়া সম্পন্ন হয়েছে।
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((u) => (
                  <div
                    key={u.id}
                    className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{u.name}</h4>
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                          পেন্ডিং
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                        <a
                          href={`tel:${u.phone}`}
                          className="flex items-center gap-1 font-semibold text-teal-800 hover:underline tabular-nums"
                        >
                          <Phone className="w-3.5 h-3.5 text-teal-600" />
                          <span>{u.phone}</span>
                        </a>
                        <span>·</span>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(u.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>অনুমোদন করুন</span>
                      </button>

                      <button
                        onClick={() => handleDeleteOrReject(u.id, 'reject')}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>বাতিল</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* All Users Tab */
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {users.map((u) => {
                const isMaster = u.id === 'user_admin_master';
                const isMe = u.id === currentUser?.id;

                return (
                  <div key={u.id} className="p-3.5 flex items-center justify-between gap-2 hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{u.name}</span>
                        {u.role === 'admin' && (
                          <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-sm font-bold">
                            অ্যাডমিন
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-sm font-semibold ${
                            u.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.status === 'approved'
                            ? 'সক্রিয়'
                            : u.status === 'pending'
                            ? 'পেন্ডিং'
                            : 'স্থগিত'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 tabular-nums">
                        <span>{u.phone}</span>
                        <span>·</span>
                        <span>লেনদেন: {toBengaliNumber(u.transactionCount || 0)} টি</span>
                      </div>
                    </div>

                    {!isMaster && !isMe && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`px-2 py-1 text-[11px] font-bold rounded-lg ${
                            u.status === 'approved'
                              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'approved' ? 'স্থগিত' : 'সক্রিয়'}
                        </button>

                        <button
                          onClick={() => handleDeleteOrReject(u.id, 'delete')}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
