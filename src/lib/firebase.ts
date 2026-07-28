import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Firestore,
} from "firebase/firestore";
import type { Feedback } from "@/data/mockData";
import { supabase } from "@/lib/supabase";

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Check if Firebase is configured
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

// Initialize Firebase (singleton)
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
}

// --- Firestore Helpers ---

const FEEDBACKS_COLLECTION = "feedbacks";

/**
 * Add a tourist feedback to Firestore.
 * Falls back to localStorage if Firebase is not configured.
 */
export async function addFeedback(feedback: Omit<Feedback, "id" | "timestamp">): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase.from("feedbacks").insert({
        destino: feedback.destino,
        nota_geral: feedback.nota_geral,
        limpo: feedback.limpo,
        sinalizado: feedback.sinalizado,
        preservado: feedback.preservado,
        acessibilidade: feedback.acessibilidade,
        seguranca: feedback.seguranca,
        custo_beneficio: feedback.custo_beneficio,
        conservacao: feedback.conservacao,
        superlotado: feedback.superlotado,
        comentario: feedback.comentario || null,
      });
      if (!error) return;
      console.warn("Supabase feedback insert failed, falling back:", error);
    } catch (error) {
      console.warn("Supabase feedback insert threw, falling back:", error);
    }
  }

  const feedbackWithTimestamp = {
    ...feedback,
    timestamp: Date.now(),
  };

  if (db) {
    try {
      await addDoc(collection(db, FEEDBACKS_COLLECTION), feedbackWithTimestamp);
      return;
    } catch (error) {
      console.warn("Firebase write failed, falling back to localStorage:", error);
    }
  }

  // Fallback: localStorage
  const stored = localStorage.getItem("poti_feedbacks");
  const feedbacks: Feedback[] = stored ? JSON.parse(stored) : [];
  feedbacks.push({
    ...feedbackWithTimestamp,
    id: `local-${Date.now()}`,
  });
  localStorage.setItem("poti_feedbacks", JSON.stringify(feedbacks));
}

/**
 * Subscribe to real-time feedback updates.
 * Returns an unsubscribe function.
 * Falls back to localStorage polling if Firebase is not configured, if the Firestore
 * listener fails to set up, or if it errors asynchronously after being set up (e.g.
 * permission-denied or network errors delivered via onSnapshot's error callback).
 */
function mapSupabaseFeedback(row: {
  id: string;
  destino: string;
  nota_geral: number;
  limpo: boolean;
  sinalizado: boolean;
  preservado: boolean;
  acessibilidade: boolean;
  seguranca: boolean;
  custo_beneficio: boolean;
  conservacao: boolean;
  superlotado: boolean;
  comentario: string | null;
  created_at: string;
}): Feedback {
  return {
    id: row.id,
    destino: row.destino,
    nota_geral: row.nota_geral,
    limpo: row.limpo,
    sinalizado: row.sinalizado,
    preservado: row.preservado,
    acessibilidade: row.acessibilidade,
    seguranca: row.seguranca,
    custo_beneficio: row.custo_beneficio,
    conservacao: row.conservacao,
    superlotado: row.superlotado,
    comentario: row.comentario ?? undefined,
    timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

export function subscribeFeedbacks(
  callback: (feedbacks: Feedback[]) => void
): () => void {
  if (supabase) {
    const client = supabase;
    let allRows: Feedback[] = [];
    let fellBackToLocal = false;
    let localCleanup: (() => void) | null = null;

    const channel = client
      .channel("feedbacks-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feedbacks" },
        (payload) => {
          allRows = [mapSupabaseFeedback(payload.new as Parameters<typeof mapSupabaseFeedback>[0]), ...allRows];
          callback(allRows);
        }
      )
      .subscribe();

    client
      .from("feedbacks")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.warn("Supabase feedbacks initial fetch failed, falling back to localStorage:", error);
          if (!fellBackToLocal) {
            fellBackToLocal = true;
            localCleanup = startLocalFeedbackPolling(callback);
          }
          return;
        }
        allRows = (data || []).map(mapSupabaseFeedback);
        callback(allRows);
      });

    return () => {
      client.removeChannel(channel);
      localCleanup?.();
    };
  }

  if (db) {
    let fellBackToLocal = false;
    let localCleanup: (() => void) | null = null;

    try {
      const q = query(
        collection(db, FEEDBACKS_COLLECTION),
        orderBy("timestamp", "desc")
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const feedbacks: Feedback[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Feedback[];
          callback(feedbacks);
        },
        (error) => {
          console.warn("Firebase listener error, falling back to localStorage:", error);
          if (!fellBackToLocal) {
            fellBackToLocal = true;
            localCleanup = startLocalFeedbackPolling(callback);
          }
        }
      );
      return () => {
        unsubscribe();
        localCleanup?.();
      };
    } catch (error) {
      console.warn("Firebase listener failed, using localStorage:", error);
    }
  }

  return startLocalFeedbackPolling(callback);
}

function startLocalFeedbackPolling(callback: (feedbacks: Feedback[]) => void): () => void {
  // Initial mock data if empty
  if (typeof window !== "undefined" && !localStorage.getItem("poti_feedbacks")) {
    const now = Date.now();
    const initialMockFeedbacks = [
      {
        id: "mock-1",
        destino: "Ponta Negra e Morro do Careca",
        nota_geral: 2,
        limpo: false,
        sinalizado: true,
        preservado: false,
        acessibilidade: true,
        seguranca: false,
        custo_beneficio: true,
        conservacao: false,
        superlotado: true,
        comentario: "Local com muito acúmulo de resíduos na areia e superlotação no acesso. A segurança precisa ser reforçada no fim da tarde.",
        timestamp: now - 3600000 * 2,
      },
      {
        id: "mock-2",
        destino: "Praia da Pipa",
        nota_geral: 5,
        limpo: true,
        sinalizado: true,
        preservado: true,
        acessibilidade: true,
        seguranca: true,
        custo_beneficio: true,
        conservacao: true,
        superlotado: false,
        comentario: "Excelente passeio! Baía dos Golfinhos é maravilhosa e muito limpa. O acesso às falésias tem boa sinalização.",
        timestamp: now - 3600000 * 4,
      },
      {
        id: "mock-3",
        destino: "São Miguel do Gostoso",
        nota_geral: 4,
        limpo: true,
        sinalizado: false,
        preservado: true,
        acessibilidade: true,
        seguranca: true,
        custo_beneficio: true,
        conservacao: true,
        superlotado: false,
        comentario: "Muito tranquilo, praia preservada e com excelente vento para velejar. Apenas falta um pouco mais de sinalização urbana.",
        timestamp: now - 3600000 * 12,
      }
    ];
    localStorage.setItem("poti_feedbacks", JSON.stringify(initialMockFeedbacks));
  }

  // Fallback: poll localStorage every 2s
  const interval = setInterval(() => {
    const stored = localStorage.getItem("poti_feedbacks");
    const feedbacks: Feedback[] = stored ? JSON.parse(stored) : [];
    callback(feedbacks);
  }, 2000);

  // Initial load
  const stored = localStorage.getItem("poti_feedbacks");
  callback(stored ? JSON.parse(stored) : []);

  return () => clearInterval(interval);
}

export { db };
