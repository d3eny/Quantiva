import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  "https://towzwaximnwmkeyvthvk.supabase.co/",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvd3p3YXhpbW53bWtleXZ0aHZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTgxMjQsImV4cCI6MjA4MjA5NDEyNH0.UcR2Vo4zQnQSmxG2TfiQvkHK9qRb_3W6g3knXG8PsrI"
);
