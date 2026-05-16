export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          nome: string;
          whatsapp: string;
          origem: string;
          status: string;
          boas_vindas_enviado: boolean;
          score_mentoria: number;
          score_mentoria_em: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          whatsapp: string;
          origem?: "grupo" | "radar" | "mentoria";
          status?: "novo" | "nutrição" | "cliente" | "inativo";
          boas_vindas_enviado?: boolean;
          score_mentoria?: number;
          score_mentoria_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          whatsapp?: string;
          origem?: "grupo" | "radar" | "mentoria";
          status?: "novo" | "nutrição" | "cliente" | "inativo";
          boas_vindas_enviado?: boolean;
          score_mentoria?: number;
          score_mentoria_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      imoveis: {
        Row: {
          id: string;
          titulo: string;
          cidade: string;
          bairro: string | null;
          valor_avaliacao: number | null;
          lance_inicial: number;
          desconto: number | null;
          score: number | null;
          status: string;
          link: string | null;
          imagem_url: string | null;
          grupo_destino: string | null;
          data_leilao: string | null;
          analise_ia: string | null;
          edital_url: string | null;
          tipo_imovel: string | null;
          modalidade: string | null;
          ocupado: boolean | null;
          fonte: string | null;
          endereco: string | null;
          processo_numero: string | null;
          enviado_radar_em: string | null;
          enviado_gratuito_em: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          cidade: string;
          bairro?: string | null;
          valor_avaliacao?: number | null;
          lance_inicial: number;
          desconto?: number | null;
          score?: number | null;
          status?: "pendente" | "publicado" | "encerrado";
          link?: string | null;
          imagem_url?: string | null;
          grupo_destino?: "gratuito" | "radar" | "ambos";
          data_leilao?: string | null;
          analise_ia?: string | null;
          edital_url?: string | null;
          tipo_imovel?: string | null;
          modalidade?: string | null;
          ocupado?: boolean | null;
          fonte?: string | null;
          endereco?: string | null;
          processo_numero?: string | null;
          enviado_radar_em?: string | null;
          enviado_gratuito_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          titulo?: string;
          cidade?: string;
          bairro?: string | null;
          valor_avaliacao?: number | null;
          lance_inicial?: number;
          desconto?: number | null;
          score?: number | null;
          status?: "pendente" | "publicado" | "encerrado";
          link?: string | null;
          imagem_url?: string | null;
          grupo_destino?: "gratuito" | "radar" | "ambos";
          data_leilao?: string | null;
          analise_ia?: string | null;
          edital_url?: string | null;
          tipo_imovel?: string | null;
          modalidade?: string | null;
          ocupado?: boolean | null;
          fonte?: string | null;
          endereco?: string | null;
          processo_numero?: string | null;
          enviado_radar_em?: string | null;
          enviado_gratuito_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      assinantes_radar: {
        Row: {
          id: string;
          lead_id: string | null;
          data_inicio: string;
          status: string;
          hotmart_subscriber_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          data_inicio?: string;
          status?: "ativo" | "cancelado" | "inadimplente";
          hotmart_subscriber_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string | null;
          data_inicio?: string;
          status?: "ativo" | "cancelado" | "inadimplente";
          hotmart_subscriber_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      aplicacoes_mentoria: {
        Row: {
          id: string;
          lead_id: string | null;
          nome: string;
          whatsapp: string;
          participou_leilao: boolean;
          orcamento: string | null;
          trava: string | null;
          status: string;
          respostas: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          nome: string;
          whatsapp: string;
          participou_leilao?: boolean;
          orcamento?: string | null;
          trava?: string | null;
          status?: "pendente" | "contatado" | "aprovado" | "rejeitado";
          respostas?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string | null;
          nome?: string;
          whatsapp?: string;
          participou_leilao?: boolean;
          orcamento?: string | null;
          trava?: string | null;
          status?: "pendente" | "contatado" | "aprovado" | "rejeitado";
          respostas?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      sequencias_nutricao: {
        Row: {
          id: string;
          lead_id: string;
          dia: number;
          tipo: "gratuito" | "radar";
          enviado: boolean;
          enviado_em: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          dia: number;
          tipo?: "gratuito" | "radar";
          enviado?: boolean;
          enviado_em?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          dia?: number;
          tipo?: "gratuito" | "radar";
          enviado?: boolean;
          enviado_em?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
