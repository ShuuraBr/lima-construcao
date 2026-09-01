import { Simbolo } from "./Simbolo";

type LogoProps = {
  /** Mostra o descritor "Construção e Instalação" abaixo do nome. */
  comDescritor?: boolean;
  className?: string;
};

/**
 * Lockup da marca para navegação e rodapé: símbolo oficial + wordmark
 * "LIMA" em Montserrat, seguindo a hierarquia de pesos do manual.
 * O símbolo é o arquivo aprovado; nada no desenho é reconstruído.
 */
export function Logo({ comDescritor = true, className }: LogoProps) {
  return (
    <span className={`flex items-center gap-3 ${className ?? ""}`}>
      <Simbolo className="h-8 w-auto shrink-0 text-logo" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.05rem] font-black tracking-[0.16em] text-texto-forte">
          LIMA
        </span>
        {comDescritor && (
          <span className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.24em] text-texto-suave">
            Construção e Instalação
          </span>
        )}
      </span>
    </span>
  );
}
