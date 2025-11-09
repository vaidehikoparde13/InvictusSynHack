import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { residentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await residentAPI.getResidentDashboard();
      const data = response.data.data;
      setStats({
        total: data.total,
        pending: data.pending,
        inProgress: data.inProgress,
        resolved: data.resolved,
      });
      setRecentComplaints(data.recentComplaints || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'badge-pending',
      Approved: 'badge-approved',
      Assigned: 'badge-assigned',
      'In Progress': 'badge-in-progress',
      Completed: 'badge-completed',
      Resolved: 'badge-resolved',
      Rejected: 'badge-rejected',
    };
    return <span className={`badge ${badges[status] || ''}`}>{status}</span>;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard container">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Complaints</h3>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <div className="stat-value">{stats.inProgress}</div>
        </div>
        <div className="stat-card">
          <h3>Resolved</h3>
          <div className="stat-value">{stats.resolved}</div>
        </div>
      </div>

      <div className="card">
        <h2>Recent Complaints</h2>
        {recentComplaints.length === 0 ? (
          <p>
            No complaints yet.{' '}
            <Link to="/resident/complaints">Submit your first complaint</Link>
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td>{complaint.title}</td>
                  <td>{complaint.category}</td>
                  <td>{getStatusBadge(complaint.status)}</td>
                  <td>{format(new Date(complaint.created_at), 'MMM dd, yyyy')}</td>
                  <td>
                    <Link
                      to={`/resident/complaints/${complaint.id}`}
                      className="btn btn-primary"
                      style={{ padding: '5px 10px', fontSize: '14px' }}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
