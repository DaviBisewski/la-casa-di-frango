import { useState } from "react";
import StartShift from '../components/ui/ButtonExpediente';
import { useExpediente } from '../hooks/useExpediente';
import StockEntry from "../screens/StockEntry";

export default function Home() {

    const { expediente } = useExpediente();

    // 📍 controla fluxo da tela
    const [step, setStep] = useState("start");
    // start | form | dashboard

    return (
        <div>

            {/* 🔥 1. INÍCIO */}
            {step === "start" && !expediente && (
                <StartShift onStart={() => setStep("form")} />
            )}

            {/* 🔥 2. FORMULÁRIO */}
            {step === "form" && (
                <StockEntry onFinish={() => setStep("dashboard")} />
            )}

            {/* 🔥 3. DASHBOARD (simples por enquanto) */}
            {(step === "dashboard" || expediente) && expediente && (
                <div className="p-12">
                    <h2 className="text-3xl font-bold text-[#0F4C3A]">
                        Expediente ativo
                    </h2>

                    <p className="mt-4 text-xl">
                        Data: {expediente.date}
                    </p>
                </div>
            )}
        </div>
    );
}