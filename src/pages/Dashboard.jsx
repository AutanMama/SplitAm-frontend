import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { toast } from '../services/toast';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [myAjos, setMyAjos] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [gRes, aRes] = await Promise.all([
        api.get('/groups'),
        api.get('/ajo/mine').catch(() => ({ data: [] })),
      ]);
      setGroups(gRes.data);
      setMyAjos(aRes.data || []);
    } catch (err) {
      toast.error("Couldn't load your groups. Check your internet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const currentUserId = useMemo(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored).id : null;
  }, []);

  const { monthlyOutflow, activeCount, myHandsByAjo } = useMemo(() => {
    const active = myAjos.filter((a) => a.cycleStatus === 'active');
    const handsMap = {};
    let total = 0;
    active.forEach((a) => {
      const myHands = (a.rotation || []).filter(
        (s) => s.user && (s.user._id || s.user) === currentUserId
      ).length;
      handsMap[a._id] = myHands;
      total += (a.contributionAmount || 0) * myHands;
    });
    return { monthlyOutflow: total, activeCount: active.length, myHandsByAjo: handsMap };
  }, [myAjos, currentUserId]);

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setIsJoining(true);
    try {
      const { data } = await api.post(`/groups/join/${inviteCode.trim().toUpperCase()}`);
      const groupName = data?.group?.name || 'group';
      setInviteCode('');
      toast.success(`Joined ${groupName}!`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || "That code didn't work. Double-check it.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 py-4 md:p-12 relative animate-in fade-in duration-700">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 gap-4 md:gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Your Groups</h1>
          <p className="text-slate-500 text-sm mt-2">Run ajo with people you trust.</p>
        </div>
        <Link
          to="/create-group"
          className="self-stretch md:self-auto bg-emerald-600 text-white px-6 md:px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Create Group
        </Link>
      </div>

      {activeCount > 0 && (
        <div className="mb-6 md:mb-8 bg-emerald-900 text-white p-6 md:p-7 rounded-[2rem] shadow-2xl shadow-emerald-900/10 border border-emerald-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
              You owe each round
            </p>
            <p className="text-3xl md:text-4xl font-black text-white">
              ₦{monthlyOutflow.toLocaleString()}
            </p>
            <p className="text-sm text-emerald-300 mt-2">
              Across {activeCount} active ajo{activeCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        <div className="lg:col-span-1">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-sm font-bold text-slate-700 mb-1">Got an invite code?</h2>
            <p className="text-xs text-slate-400 mb-5">Paste it below to join a group.</p>
            <form onSubmit={handleJoinGroup} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. AX72J3F1"
                className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none uppercase font-mono font-black text-emerald-900 text-center text-lg tracking-widest transition-all"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                maxLength={12}
              />
              <button
                type="submit"
                disabled={isJoining || !inviteCode.trim()}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-xl shadow-slate-100"
              >
                {isJoining ? 'Joining…' : 'Join Group'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 px-4 mb-2">
            <div className="w-2 h-4 bg-emerald-500 rounded-full"></div>
            <h3 className="text-sm font-bold text-slate-600">
              {groups.length === 0 ? 'No groups yet' : `${groups.length} group${groups.length === 1 ? '' : 's'}`}
            </h3>
          </div>

          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-slate-50 rounded-[2rem] animate-pulse border border-slate-100" />
            ))
          ) : groups.length > 0 ? (
            groups.map((group) => {
              const ajoForGroup = myAjos.find((a) => (a.groupId?._id || a.groupId) === group._id);
              const myHands = ajoForGroup ? (myHandsByAjo[ajoForGroup._id] || 0) : 0;
              const myPerRound = ajoForGroup ? ajoForGroup.contributionAmount * myHands : 0;
              return (
                <Link
                  key={group._id}
                  to={`/group/${group._id}`}
                  className="group bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-300 flex justify-between items-center overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-12 -mt-12 opacity-0 group-hover:opacity-40 transition-opacity"></div>

                  <div className="relative z-10 min-w-0 flex-1 pr-3">
                    <h3 className="text-lg md:text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight truncate">
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg text-xs font-bold group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                      </span>
                      {ajoForGroup && myHands > 0 ? (
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                          {myHands} hand{myHands === 1 ? '' : 's'} · ₦{myPerRound.toLocaleString()}/round
                        </span>
                      ) : ajoForGroup ? (
                        <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                          Ajo setup · request hands
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">No ajo yet</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 w-11 h-11 flex items-center justify-center rounded-2xl group-hover:bg-slate-900 group-hover:rotate-45 transition-all duration-300 relative z-10 shrink-0">
                    <svg className="h-5 w-5 text-slate-400 group-hover:text-white group-hover:-rotate-45 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-12 md:py-16 bg-slate-50/50 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-200 px-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-base font-bold text-slate-700">You're not in any ajo groups yet</p>
              <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                Create a group to start an ajo, or paste an invite code from a friend.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
