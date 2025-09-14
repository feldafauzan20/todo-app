import { createClient } from "@supabase/supabase-js";

// Ganti dengan info proyek Supabase kamu
const supabaseUrl = "https://zobtvnminagptpzifhgn.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYnR2bm1pbmFncHRwemlmaGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTM4MTksImV4cCI6MjA3MzA4OTgxOX0.ZLOCfRbwO-U01t41-6K3bo-sNrZ2yvVRgz5ykfSHri8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // coba ambil 1 data dari table 'todos' (ganti sesuai table di proyekmu)
    const { data, error } = await supabase.from("todos").select("*").limit(1);

    if (error) {
      console.error("❌ Koneksi gagal:", error.message);
    } else {
      console.log("✅ Koneksi berhasil! Contoh data:", data);
    }
  } catch (err) {
    console.error("❌ Terjadi error:", err.message);
  }
}

testConnection();
