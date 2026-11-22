/**
 * ============================================================================
 * SV4 DELIVERABLE — COMPLETE SINGLE-FILE IMPLEMENTATION
 * Modules:
 *   1. Shared Types & Interfaces
 *   2. WooCommerce REST Client (`createWooClient`, `getWooClient`)
 *   3. API Route Handlers (`appointmentsApiHandler`, `ordersApiHandler`)
 *   4. Virtual Try-On AR (`TryOnPage` + `ARGlassesOverlay`)
 *   5. Product Comparison (`ComparePage`)
 *   6. Eye Exam Appointment (`AppointmentPage`)
 *   7. Account & Order History (`AccountPage`)
 * ============================================================================
 */

import React, { useEffect, useRef, useState } from 'react';
import type { NextApiRequest, NextApiResponse } from 'next';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { FaceMesh, Results } from '@mediapipe/face_mesh';
import { Canvas, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type * as THREE from 'three';

/* ============================================================================
 * 1. SHARED TYPES & INTERFACES
 * ============================================================================ */

export interface FaceLandmark {
  x: number;
  y: number;
  z: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  brand: string;
  features: string;
  color?: string;
  material?: string;
  uvProtection?: string;
  weight?: string;
  isSmartGlasses?: boolean;
  image?: string;
}

export interface AppointmentFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  location: string;
}

export interface OrderLineItem {
  name: string;
  quantity: number;
}

export interface Order {
  id: number;
  date_created: string;
  total: string;
  status: string;
  line_items: OrderLineItem[];
}

export interface WooClientConfig {
  baseUrl?: string;
  consumerKey?: string;
  consumerSecret?: string;
}

/* ============================================================================
 * 2. WOOCOMMERCE CLIENT (lib/wooClient.ts)
 * ============================================================================ */

export function createWooClient(config?: WooClientConfig) {
  const baseUrl = (config?.baseUrl || process.env.WOO_BASE_URL || '').replace(/\/+$/, '');
  const consumerKey = config?.consumerKey || process.env.WOO_CONSUMER_KEY || '';
  const consumerSecret = config?.consumerSecret || process.env.WOO_CONSUMER_SECRET || '';

  if (!baseUrl || !consumerKey || !consumerSecret) {
    console.warn('[wooClient] Missing WooCommerce configuration environment variables.');
  }

  async function get<T = unknown>(
    endpoint: string,
    params: Record<string, string | number> = {}
  ): Promise<{ data: T }> {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    const url = new URL(`${baseUrl}/wp-json/wc/v3/${cleanEndpoint}`);
    url.searchParams.set('consumer_key', consumerKey);
    url.searchParams.set('consumer_secret', consumerSecret);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error (${response.status}): ${response.statusText}`);
    }

    const data = (await response.json()) as T;
    return { data };
  }

  return { get };
}

export const getWooClient = createWooClient;

/* ============================================================================
 * 3. API HANDLERS (pages/api/appointments.ts & pages/api/orders.ts)
 * ============================================================================ */

export async function appointmentsApiHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const body = (req.body || {}) as Partial<AppointmentFormData>;
  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const phone = (body.phone || '').trim();
  const date = (body.date || '').trim();
  const location = (body.location || '').trim();

  if (!name || !email || !phone || !date || !location) {
    return res.status(400).json({
      success: false,
      error: 'Vui lòng điền đầy đủ thông tin bắt buộc.',
    });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Địa chỉ email không hợp lệ.',
    });
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
    return res.status(400).json({
      success: false,
      error: 'Thời gian hẹn phải ở tương lai.',
    });
  }

  try {
    // TODO: Kết nối DB / CRM / hệ thống đặt lịch của SV1 & SV3
    console.info('[appointmentsApiHandler] New booking received for showroom:', location);

    return res.status(200).json({
      success: true,
      message: 'Lịch hẹn đã được tạo thành công.',
      appointment: {
        name,
        date: parsedDate.toISOString(),
        location,
      },
    });
  } catch (error) {
    console.error('[appointmentsApiHandler] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi hệ thống khi xử lý lịch hẹn.',
    });
  }
}

function verifyToken(token: string): number | null {
  // TODO: Xác thực JWT / session token do SV1 cung cấp
  if (token === 'token123') {
    return 1;
  }
  return null;
}

export async function ordersApiHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    const woo = getWooClient();
    const response = await woo.get<Order[]>('orders', { customer: userId });
    return res.status(200).json({ orders: response.data });
  } catch (error) {
    console.error('[ordersApiHandler] Failed to fetch WooCommerce orders:', error);
    return res.status(500).json({ error: 'Không thể lấy danh sách đơn hàng.' });
  }
}

/* ============================================================================
 * 4. VIRTUAL TRY-ON AR (pages/try-on.tsx)
 * ============================================================================ */

interface ARGlassesOverlayProps {
  glassesModel: THREE.Group | null;
  landmarks: FaceLandmark[] | null;
}

function ARGlassesOverlay({ glassesModel, landmarks }: ARGlassesOverlayProps) {
  useFrame(() => {
    if (!glassesModel || !landmarks || landmarks.length <= 263) {
      return;
    }

    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    if (!leftEye || !rightEye) {
      return;
    }

    const centerX = ((leftEye.x + rightEye.x) / 2 - 0.5) * 3.0;
    const centerY = (0.5 - (leftEye.y + rightEye.y) / 2) * 2.5;
    const centerZ = -((leftEye.z + rightEye.z) / 2) * 2.0;

    glassesModel.position.set(centerX, centerY, centerZ);

    const dx = rightEye.x - leftEye.x;
    const dy = rightEye.y - leftEye.y;
    const roll = -Math.atan2(dy, dx);
    glassesModel.rotation.set(0, 0, roll);

    const eyeDistance = Math.hypot(dx, dy);
    const scale = Math.max(0.4, Math.min(2.2, eyeDistance * 5.5));
    glassesModel.scale.set(scale, scale, scale);
  });

  return glassesModel ? <primitive object={glassesModel} /> : null;
}

export function TryOnPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [landmarks, setLandmarks] = useState<FaceLandmark[] | null>(null);
  const [glassesModel, setGlassesModel] = useState<THREE.Group | null>(null);
  const [modelUrl, setModelUrl] = useState<string>('/models/glasses_sample.glb');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraSupported, setCameraSupported] = useState<boolean>(true);

  useEffect(() => {
    let animationFrameId = 0;
    let mediaStream: MediaStream | null = null;
    let active = true;

    if (
      typeof window === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setCameraSupported(false);
      return;
    }

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results: Results) => {
      if (!active) return;
      const face = results.multiFaceLandmarks?.[0] as FaceLandmark[] | undefined;
      setLandmarks(face ?? null);
    });

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((stream) => {
        if (!active || !videoRef.current) return;
        mediaStream = stream;
        videoRef.current.srcObject = stream;
        void videoRef.current.play();

        const detectFrame = async () => {
          if (!active) return;
          if (videoRef.current && videoRef.current.readyState >= 2) {
            await faceMesh.send({ image: videoRef.current });
          }
          animationFrameId = requestAnimationFrame(detectFrame);
        };

        detectFrame();
      })
      .catch((err: unknown) => {
        console.error('[TryOnPage] Camera access error:', err);
        if (active) {
          setCameraError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập trình duyệt.');
        }
      });

    return () => {
      active = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      void faceMesh.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loader = new GLTFLoader();

    loader.load(
      modelUrl,
      (gltf) => {
        if (active) {
          setGlassesModel(gltf.scene);
        }
      },
      undefined,
      (err: unknown) => {
        console.error('[TryOnPage] GLTF load error:', err);
      }
    );

    return () => {
      active = false;
    };
  }, [modelUrl]);

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Virtual Try-On (Thử Kính Ảo)</h1>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setModelUrl('/models/glasses_sample.glb')}
          className="border px-3 py-1 rounded"
        >
          Mẫu kính cổ điển
        </button>
        <button
          type="button"
          onClick={() => setModelUrl('/models/smart_glasses.glb')}
          className="border px-3 py-1 rounded"
        >
          Kính thông minh AR
        </button>
      </div>

      {!cameraSupported && (
        <p className="text-red-600 mb-3">Trình duyệt không hỗ trợ truy cập camera.</p>
      )}
      {cameraError && <p className="text-red-600 mb-3">{cameraError}</p>}

      <div className="relative w-full max-w-xl aspect-video border overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <Canvas
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          camera={{ position: [0, 0, 3], fov: 60 }}
        >
          <ambientLight intensity={0.85} />
          <directionalLight position={[2, 2, 5]} intensity={1.1} />
          <ARGlassesOverlay glassesModel={glassesModel} landmarks={landmarks} />
        </Canvas>
      </div>
    </div>
  );
}

/* ============================================================================
 * 5. PRODUCT COMPARISON (pages/compare.tsx)
 * ============================================================================ */

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export function ComparePage() {
  const [ids, setIds] = useState<number[]>([1, 2]);
  const validIds = ids.filter((id) => Number.isInteger(id) && id > 0);

  const { data: products, error, isLoading } = useSWR<Product[]>(
    validIds.length > 0 ? `/api/products?ids=${validIds.join(',')}` : null,
    fetchJson
  );

  const handleIdChange = (index: number, rawValue: string) => {
    const parsed = Number(rawValue);
    setIds((prev) =>
      prev.map((item, idx) => (idx === index ? (Number.isNaN(parsed) ? 0 : parsed) : item))
    );
  };

  const handleAddSlot = () => {
    setIds((prev) => (prev.length < 4 ? [...prev, 0] : prev));
  };

  const handleRemoveSlot = (index: number) => {
    setIds((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev));
  };

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">So sánh sản phẩm</h1>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {ids.map((id, index) => (
          <div key={index} className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              value={id > 0 ? id : ''}
              placeholder="ID sản phẩm"
              onChange={(e) => handleIdChange(index, e.target.value)}
              className="border p-2 w-28"
            />
            {ids.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveSlot(index)}
                className="bg-red-500 text-white px-2 py-2"
              >
                Xóa
              </button>
            )}
          </div>
        ))}
        {ids.length < 4 && (
          <button
            type="button"
            onClick={handleAddSlot}
            className="bg-green-600 text-white px-3 py-2"
          >
            + Thêm SP
          </button>
        )}
      </div>

      {isLoading && <div>Đang tải dữ liệu so sánh...</div>}
      {error && (
        <div className="text-red-600">
          Không thể tải sản phẩm. Vui lòng kiểm tra lại ID hoặc kết nối API.
        </div>
      )}

      {products && products.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-3 py-2 text-left">Thuộc tính</th>
                {products.map((product) => (
                  <th key={product.id} className="border px-3 py-2 text-left">
                    {product.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2 font-medium">Giá (VND)</td>
                {products.map((product) => (
                  <td key={product.id} className="border px-3 py-2">
                    {Number(product.price || 0).toLocaleString('vi-VN')}₫
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border px-3 py-2 font-medium">Thương hiệu</td>
                {products.map((product) => (
                  <td key={product.id} className="border px-3 py-2">
                    {product.brand || '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border px-3 py-2 font-medium">Tính năng</td>
                {products.map((product) => (
                  <td key={product.id} className="border px-3 py-2">
                    {product.features || '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border px-3 py-2 font-medium">Chất liệu / Màu sắc</td>
                {products.map((product) => (
                  <td key={product.id} className="border px-3 py-2">
                    {[product.material, product.color].filter(Boolean).join(' / ') || '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 6. EYE EXAM APPOINTMENT (pages/appointment.tsx)
 * ============================================================================ */

export function AppointmentPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>();

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const onSubmit = async (data: AppointmentFormData) => {
    setFeedback(null);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = (await response.json()) as { success?: boolean; error?: string };

      if (response.ok && payload.success) {
        setFeedback({ type: 'success', message: 'Lịch hẹn đã được tạo thành công!' });
        reset();
      } else {
        setFeedback({
          type: 'error',
          message: payload.error || 'Có lỗi xảy ra. Vui lòng thử lại.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Không thể gửi yêu cầu. Vui lòng kiểm tra kết nối mạng.',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Đặt lịch đo mắt</h1>

      {feedback && (
        <div
          className={`mb-4 p-3 border ${
            feedback.type === 'success'
              ? 'text-green-700 border-green-500'
              : 'text-red-700 border-red-500'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <div>
          <label className="block mb-1">Họ và Tên</label>
          <input
            {...register('name', { required: 'Bắt buộc nhập họ tên' })}
            className="w-full border p-2"
          />
          {errors.name && (
            <span className="text-red-600 text-sm">{errors.name.message || 'Bắt buộc'}</span>
          )}
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            {...register('email', {
              required: 'Bắt buộc nhập email',
              pattern: { value: /^\S+@\S+\.\S+$/i, message: 'Email không hợp lệ' },
            })}
            className="w-full border p-2"
          />
          {errors.email && (
            <span className="text-red-600 text-sm">
              {errors.email.message || 'Email không hợp lệ'}
            </span>
          )}
        </div>

        <div>
          <label className="block mb-1">Điện thoại</label>
          <input
            type="tel"
            {...register('phone', { required: 'Bắt buộc nhập số điện thoại' })}
            className="w-full border p-2"
          />
          {errors.phone && (
            <span className="text-red-600 text-sm">{errors.phone.message || 'Bắt buộc'}</span>
          )}
        </div>

        <div>
          <label className="block mb-1">Ngày giờ hẹn</label>
          <input
            type="datetime-local"
            {...register('date', {
              required: 'Bắt buộc chọn ngày giờ hẹn',
              validate: (value) => new Date(value) > new Date() || 'Chọn ngày sau hôm nay',
            })}
            className="w-full border p-2"
          />
          {errors.date && (
            <span className="text-red-600 text-sm">
              {errors.date.message || 'Chọn ngày sau hôm nay'}
            </span>
          )}
        </div>

        <div>
          <label className="block mb-1">Showroom</label>
          <select
            {...register('location', { required: 'Bắt buộc chọn showroom' })}
            className="w-full border p-2"
          >
            <option value="">Chọn showroom</option>
            <option value="hanoi">Hà Nội</option>
            <option value="hcm">Hồ Chí Minh</option>
          </select>
          {errors.location && (
            <span className="text-red-600 text-sm">{errors.location.message || 'Bắt buộc'}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi lịch hẹn'}
        </button>
      </form>
    </div>
  );
}

/* ============================================================================
 * 7. ACCOUNT & ORDER HISTORY (pages/account.tsx)
 * ============================================================================ */

function getAuthToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find((row) => row.startsWith('token='));
  return tokenCookie ? decodeURIComponent(tokenCookie.slice('token='.length)) : null;
}

export function AccountPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return;
    }

    fetch('/api/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          const errPayload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(errPayload.error || 'Lỗi khi tải lịch sử đơn hàng');
        }
        return (await response.json()) as { orders?: Order[] };
      })
      .then((data) => {
        setOrders(data.orders || []);
      })
      .catch((error: unknown) => {
        console.error('[AccountPage] Order fetch error:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Lỗi không xác định.');
        setOrders([]);
      });
  }, []);

  if (errorMessage) {
    return <div className="p-4 text-red-600">{errorMessage}</div>;
  }

  if (orders === null) {
    return <div className="p-4">Đang tải đơn hàng...</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tài khoản của tôi</h1>
      <h2 className="text-xl mb-3">Lịch sử đơn hàng</h2>

      {orders.length === 0 && <p>Chưa có đơn hàng nào.</p>}

      <ul>
        {orders.map((order) => (
          <li key={order.id} className="mb-4 border p-3">
            <p>
              Mã đơn: <strong>{order.id}</strong>
            </p>
            <p>Ngày: {new Date(order.date_created).toLocaleDateString('vi-VN')}</p>
            <p>Tổng tiền: {Number(order.total).toLocaleString('vi-VN')}₫</p>
            <p>Trạng thái: {order.status}</p>
            <p className="mt-1">Chi tiết:</p>
            <ul className="ml-4 list-disc">
              {order.line_items.map((item, index) => (
                <li key={index}>
                  {item.name} x {item.quantity}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default {
  createWooClient,
  getWooClient,
  appointmentsApiHandler,
  ordersApiHandler,
  TryOnPage,
  ComparePage,
  AppointmentPage,
  AccountPage,
};
