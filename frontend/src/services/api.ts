/**
 * API client for NPC Portal backend.
 */

import axios from 'axios';
import type { ApiResponse, Domain, NpcOffice, Advert } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('npc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──
export async function register(email: string, password: string, name: string, mobile?: string) {
  const { data } = await api.post<ApiResponse<{ user: any; token: string }>>('/auth/register', { email, password, name, mobile });
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<ApiResponse<{ user: any; token: string }>>('/auth/login', { email, password });
  return data;
}

// ── Profile ──
export async function getProfile() {
  const { data } = await api.get('/profile');
  return data;
}

export async function upsertProfile(profileData: Record<string, any>) {
  const { data } = await api.post('/profile', profileData);
  return data;
}

export async function uploadDocument(file: File, documentType: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  const { data } = await api.post('/profile/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// ── Master data ──
export async function getDomains() {
  const { data } = await api.get<ApiResponse<Domain[]>>('/master/domains');
  return data.data!;
}

export async function getOffices() {
  const { data } = await api.get<ApiResponse<NpcOffice[]>>('/master/offices');
  return data.data!;
}

export async function getPublishedAdverts() {
  const { data } = await api.get<ApiResponse<Advert[]>>('/master/adverts/published');
  return data.data!;
}

export async function getAdvertById(id: string) {
  const { data } = await api.get<ApiResponse<Advert>>(`/master/adverts/${id}`);
  return data.data!;
}

// ── Admin: adverts ──
export async function getAllAdverts() {
  const { data } = await api.get<ApiResponse<Advert[]>>('/admin/adverts');
  return data.data!;
}

export async function createAdvert(payload: Record<string, any>) {
  const { data } = await api.post('/admin/adverts', payload);
  return data;
}

export async function publishAdvertApi(id: string) {
  const { data } = await api.post(`/admin/adverts/${id}/publish`);
  return data;
}

// ── Empanelment applications ──
export async function submitEmpanelmentApplication(payload: {
  profileId: string;
  domainId: string;
  subDomainId?: string;
  empanelmentArea: string;
  officePreferenceIds: string[];
}) {
  const { data } = await api.post('/applications/empanelment', payload);
  return data;
}

export async function submitEmpanelmentFull(payload: Record<string, any>) {
  const { data } = await api.post('/applications/empanelment/full', payload);
  return data;
}

export async function getEmpanelmentApplication(id: string) {
  const { data } = await api.get(`/applications/empanelment/${id}`);
  return data;
}

// ── Contractual applications ──
export async function submitContractualApplication(payload: { profileId: string; advertId: string }) {
  const { data } = await api.post('/applications/contractual', payload);
  return data;
}

export async function submitContractualFull(payload: Record<string, any>) {
  const { data } = await api.post('/applications/contractual/full', payload);
  return data;
}

// ── My Applications ──
export async function getMyEmpanelmentApplications(profileId: string) {
  const { data } = await api.get(`/applications/empanelment/my/${profileId}`);
  return data.data;
}

export async function getMyContractualApplications(profileId: string) {
  const { data } = await api.get(`/applications/contractual/my/${profileId}`);
  return data.data;
}

// ── Committee ──
export async function getScreeningPendingEmpanelment(page = 1) {
  const { data } = await api.get(`/committee/screening/empanelment/pending?page=${page}`);
  return data;
}

export default api;
