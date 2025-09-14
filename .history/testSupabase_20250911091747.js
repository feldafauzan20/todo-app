import { createClient } from "@supabase/supabase-js";

// Ganti dengan info proyek Supabase kamu
const supabaseUrl = "https://zobtvnminagptpzifhgn.supabase.co";
const supabaseKey = "<YOUR-ANON-KEY>";

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
