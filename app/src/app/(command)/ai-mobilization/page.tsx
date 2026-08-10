import { auth } from "@/lib/auth";
import { getMisiMenungguApproval } from "@/lib/misi-data";
import { getPengaturanSistem } from "@/lib/pengaturan-data";
import { AiMobilizationView } from "@/components/misi/ai-mobilization-view";

export default async function AiMobilizationPage() {
  const [session, misiMenunggu, pengaturan] = await Promise.all([
    auth(),
    getMisiMenungguApproval(),
    getPengaturanSistem(),
  ]);
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <AiMobilizationView misiMenunggu={misiMenunggu} role={session?.user?.role} pengaturan={pengaturan} />
    </div>
  );
}
