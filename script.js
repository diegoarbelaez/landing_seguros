// Landing Page JavaScript - Demo Seguros
// Simulación de pago PSE y comunicación con el bot

class PaymentProcessor {
    constructor() {
        this.initializeEventListeners();
        this.loadUserData();
    }

    initializeEventListeners() {
        // Form submission
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.handlePayment(e));
        } else {
            console.warn('Formulario de pago no encontrado');
        }

        // Payment method selection
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
            if (method) {
                method.addEventListener('click', () => this.selectPaymentMethod(method));
            }
        });

        // Form validation
        const inputs = document.querySelectorAll('input[required]');
        inputs.forEach(input => {
            if (input) {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            }
        });

        // Control del botón de pago basado en términos y condiciones
        const acceptTerms = document.getElementById('acceptTerms');
        const paymentButton = document.getElementById('paymentButton');
        
        if (acceptTerms && paymentButton) {
            // Función para actualizar el estado del botón
            const updateButtonState = () => {
                if (acceptTerms.checked) {
                    paymentButton.disabled = false;
                    paymentButton.style.opacity = '1';
                    paymentButton.style.cursor = 'pointer';
                    paymentButton.textContent = 'Pagar $15.000 COP →';
                } else {
                    paymentButton.disabled = true;
                    paymentButton.style.opacity = '0.5';
                    paymentButton.style.cursor = 'not-allowed';
                    paymentButton.textContent = 'Acepta los términos para continuar';
                }
            };
            
            // Actualizar estado inicial
            updateButtonState();
            
            // Actualizar cuando cambie el checkbox
            acceptTerms.addEventListener('change', updateButtonState);
        }
    }

    loadUserData() {
        // Obtener datos del usuario desde la URL o localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const phoneNumber = urlParams.get('phone') || '34692853761';
        console.log("phoneNumber - received", phoneNumber);
        const userName = urlParams.get('name') || 'Cliente Demo';

        // Pre-llenar algunos campos si están disponibles
        const phoneInput = document.getElementById('phone');
        if (phoneInput && phoneNumber) {
            phoneInput.value = phoneNumber;
        }

        const nameInput = document.getElementById('fullName');
        if (nameInput && userName !== 'Cliente Demo') {
            nameInput.value = userName;
        }

        // Guardar datos para el pago
        this.paymentData = {
            phoneNumber: phoneNumber,
            userName: userName,
            timestamp: new Date().toISOString()
        };
    }

    selectPaymentMethod(method) {
        // Remover selección anterior
        document.querySelectorAll('.payment-method').forEach(m => {
            m.classList.remove('selected');
        });

        // Seleccionar método actual
        method.classList.add('selected');
        this.selectedPaymentMethod = method.dataset.method;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Validaciones específicas por campo
        switch (fieldName) {
            case 'fullName':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'El nombre debe tener al menos 2 caracteres';
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Ingresa un correo electrónico válido';
                }
                break;
            case 'phone':
                const phoneRegex = /^[0-9+\-\s()]+$/;
                if (!phoneRegex.test(value) || value.length < 7) {
                    isValid = false;
                    errorMessage = 'Ingresa un número de teléfono válido';
                }
                break;
            case 'document':
                if (value.length < 6) {
                    isValid = false;
                    errorMessage = 'El documento debe tener al menos 6 caracteres';
                }
                break;
        }

        this.showFieldError(field, isValid, errorMessage);
        return isValid;
    }

    showFieldError(field, isValid, message) {
        const formGroup = field.closest('.form-group');
        
        // Verificar que formGroup existe
        if (!formGroup) {
            console.warn('FormGroup no encontrado para el campo:', field);
            return;
        }
        
        let errorElement = formGroup.querySelector('.field-error');

        if (!isValid) {
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'field-error';
                errorElement.style.cssText = `
                    color: #ef4444;
                    font-size: 12px;
                    margin-top: 4px;
                    font-weight: 500;
                `;
                formGroup.appendChild(errorElement);
            }
            errorElement.textContent = message;
            field.style.borderColor = '#ef4444';
        } else {
            if (errorElement) {
                errorElement.remove();
            }
            field.style.borderColor = '#10b981';
        }
    }

    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        
        // Verificar que formGroup existe
        if (!formGroup) {
            console.warn('FormGroup no encontrado para el campo:', field);
            return;
        }
        
        const errorElement = formGroup.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
        field.style.borderColor = '#e5e7eb';
    }

    validateForm() {
        console.log("validateForm");
        const requiredFields = document.querySelectorAll('input[required]');
        console.log("requiredFields", requiredFields);
        let isFormValid = true;

        requiredFields.forEach(field => {
            if (field && !this.validateField(field)) {
                isFormValid = false;
            }
        });

        // Validar términos y condiciones
        const acceptTerms = document.getElementById('acceptTerms');
        if (acceptTerms && !acceptTerms.checked) {
            isFormValid = false;
            this.showTermsError();
        } else {
            this.clearTermsError();
        }
        console.log("isFormValid", isFormValid);
        return isFormValid;
    }

    showTermsError() {
        const termsSection = document.querySelector('.terms-section');
        
        if (!termsSection) {
            console.warn('Sección de términos no encontrada');
            return;
        }
        
        let errorElement = termsSection.querySelector('.terms-error');

        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'terms-error';
            errorElement.style.cssText = `
                color: #ef4444;
                font-size: 14px;
                margin-top: 8px;
                font-weight: 500;
            `;
            termsSection.appendChild(errorElement);
        }
        errorElement.textContent = 'Debes aceptar los términos y condiciones para continuar';
    }

    clearTermsError() {
        const termsSection = document.querySelector('.terms-section');
        
        if (!termsSection) {
            return;
        }
        
        const errorElement = termsSection.querySelector('.terms-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    async handlePayment(event) {
        event.preventDefault();

        // Validar formulario
        if (!this.validateForm()) {
            this.showNotification('Por favor corrige los errores en el formulario', 'error');
            return;
        }

        // Mostrar loading
        this.showLoading();

        try {
            // Simular procesamiento de pago PSE
            await this.simulatePSEPayment();
            
            // Simular éxito del pago
            await this.simulatePaymentSuccess();
            
        } catch (error) {
            console.error('Error en el pago:', error);
            this.showNotification('Error procesando el pago. Intenta nuevamente.', 'error');
            this.hideLoading();
        }
    }

    async simulatePSEPayment() {
        // Simular tiempo de procesamiento PSE
        const processingSteps = [
            'Validando datos del cliente...',
            'Conectando con el banco...',
            'Verificando fondos...',
            'Procesando transacción...',
            'Confirmando pago...'
        ];

        for (let i = 0; i < processingSteps.length; i++) {
            await this.delay(1000); // 1 segundo por paso
            this.updateLoadingMessage(processingSteps[i]);
        }
    }

    async simulatePaymentSuccess() {
        // Generar ID de transacción
        const transactionId = 'DEMO-' + Date.now();
        
        // Actualizar modal de éxito
        document.getElementById('transactionId').textContent = transactionId;

        // Ocultar loading y mostrar éxito
        this.hideLoading();
        this.showSuccessModal();

        // Enviar confirmación al bot
        await this.notifyBotPaymentSuccess(transactionId);
    }

    async notifyBotPaymentSuccess(transactionId) {
        try {
            const paymentData = {
                phoneNumber: this.paymentData.phoneNumber,
                paymentStatus: 'success',
                transactionId: transactionId,
                amount: 15000,
                timestamp: new Date().toISOString(),
                userData: this.getFormData()
            };

            console.log('Enviando confirmación de pago al bot:', paymentData);

            // Enviar al endpoint del bot

            let url = 'https://f729c47d77f5.ngrok-free.app/api/payment-confirmation';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            if (response.ok) {
                console.log('✅ Confirmación de pago enviada exitosamente al bot');
            } else {
                console.error('❌ Error enviando confirmación al bot:', response.status);
            }

        } catch (error) {
            console.error('❌ Error notificando al bot:', error);
        }
    }

    getFormData() {
        const form = document.getElementById('paymentForm');
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.add('show');
        this.updateLoadingMessage('Iniciando proceso de pago...');
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.remove('show');
    }

    updateLoadingMessage(message) {
        const loadingContent = document.querySelector('.loading-content p');
        if (loadingContent) {
            loadingContent.textContent = message;
        }
    }

    showSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.classList.add('show');
        
        // Actualizar progreso
        this.updateProgressSteps(3);
    }

    updateProgressSteps(activeStep) {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            if (index < activeStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    showNotification(message, type = 'info') {
        console.log("message", message);
        console.log("type", type);
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 1001;
            font-weight: 500;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Función global para cerrar modal
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
    
    // Cierra la ventana
    window.close();
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Landing Page Demo Seguros - Inicializada');
    
    // Verificar que los elementos críticos existen
    const criticalElements = [
        'paymentForm',
        'paymentButton',
        'loadingOverlay',
        'successModal'
    ];
    
    let allElementsExist = true;
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`❌ Elemento crítico no encontrado: ${id}`);
            allElementsExist = false;
        } else {
            console.log(`✅ Elemento encontrado: ${id}`);
        }
    });
    
    if (!allElementsExist) {
        console.error('❌ Algunos elementos críticos no se encontraron. Verifica el HTML.');
        return;
    }
    
    // Inicializar procesador de pagos
    try {
        window.paymentProcessor = new PaymentProcessor();
        console.log('✅ PaymentProcessor inicializado correctamente');
    } catch (error) {
        console.error('❌ Error inicializando PaymentProcessor:', error);
        return;
    }
    
    // Mostrar información de debug
    const urlParams = new URLSearchParams(window.location.search);
    console.log('📱 Parámetros de URL:', Object.fromEntries(urlParams));
    console.log('🔗 URL completa:', window.location.href);
    
    // Simular datos de usuario si vienen de WhatsApp
    const phoneFromWhatsApp = urlParams.get('phone');
    if (phoneFromWhatsApp) {
        console.log('📞 Teléfono desde WhatsApp:', phoneFromWhatsApp);
    }
    
    console.log('🎉 Landing page lista para usar');
});

// Manejar errores globales
window.addEventListener('error', (event) => {
    console.error('❌ Error en landing page:', event.error);
});

// Prevenir cierre accidental durante el pago
let paymentInProgress = false;

window.addEventListener('beforeunload', (event) => {
    if (paymentInProgress) {
        event.preventDefault();
        event.returnValue = 'El pago está en proceso. ¿Estás seguro de que quieres salir?';
        return event.returnValue;
    }
});

// Exportar para uso global
window.PaymentProcessor = PaymentProcessor;
