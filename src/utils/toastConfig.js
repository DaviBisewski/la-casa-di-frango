/**
 * Configuração centralizada de notificações Toastify
 * Padroniza mensagens e estilos para toda a aplicação
 */

import { toast } from 'react-toastify';

/**
 * Notificação de sucesso
 * @param {string} mensagem - Mensagem a exibir
 * @returns {void}
 */
export const notificarSucesso = (mensagem) => {
  toast.success(mensagem, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Notificação de erro
 * @param {string} mensagem - Mensagem a exibir
 * @returns {void}
 */
export const notificarErro = (mensagem) => {
  toast.error(mensagem, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Notificação informativa (neutra)
 * @param {string} mensagem - Mensagem a exibir
 * @returns {void}
 */
export const notificarInfo = (mensagem) => {
  toast.info(mensagem, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Notificação de aviso
 * @param {string} mensagem - Mensagem a exibir
 * @returns {void}
 */
export const notificarAviso = (mensagem) => {
  toast.warning(mensagem, {
    position: 'top-right',
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

/**
 * Mensagens padronizadas para ações comuns
 */
export const MENSAGENS = {
  // Sucessos
  EXPEDIENTE_CRIADO: 'Expediente iniciado com sucesso! 🎉',
  ENCOMENDA_ADICIONADA: 'Encomenda adicionada com sucesso! 📦',
  VENDA_REGISTRADA: 'Venda registrada com sucesso! ✅',
  
  // Avisos
  QUANTIDADE_INSUFICIENTE: 'Atenção: Quantidade indisponível em estoque',
  ENCOMENDA_EM_FALTA: (quantidade) => `Total em falta: ${quantidade} unidades`,
  
  // Informações
  EXPEDIENTE_VISUALIZADO: (data) => `Visualizando expediente de ${data}`,
  
  // Erros
  ERRO_GENERICO: 'Ocorreu um erro ao processar a ação',
  ERRO_VALIDACAO: 'Verifique os dados e tente novamente',
  ERRO_SALVAR: 'Erro ao salvar os dados',
};

export default {
  notificarSucesso,
  notificarErro,
  notificarInfo,
  notificarAviso,
  MENSAGENS,
};
