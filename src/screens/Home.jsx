import Header from '../components/Header/header';
import StartShift from '../components/ui/ButtonExpediente';
import { useExpediente } from '../hooks/useExpediente';

export default function Home() {

    // 📍 AQUI entra a lógica
    const { expediente, iniciarExpediente } = useExpediente();

    return (
        <div>
            <Header />

            {/* 🔥 se NÃO tem expediente */}
            {!expediente && (
                <StartShift onStart={iniciarExpediente} />
            )}

            {/* 🔥 se TEM expediente */}
            {expediente && (
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