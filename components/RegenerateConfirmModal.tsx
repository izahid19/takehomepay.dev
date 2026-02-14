import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface RegenerateConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function RegenerateConfirmModal({ isOpen, onClose, onConfirm, loading }: RegenerateConfirmModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card border-border max-w-[450px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold tracking-tight">Confirm Regeneration</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground text-base leading-relaxed">
            You haven't changed any details. Are you sure you want to regenerate the <span className="text-foreground font-semibold underline decoration-amber-500/30">exact same proposal</span>? 
            <br /><br />
            This will consume <span className="text-primary font-bold">1-2 credits</span> from your balance.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="border-border hover:bg-muted font-bold h-11 px-6">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold border-none transition-all active:scale-95 shadow-lg shadow-emerald-900/20 h-11 px-8 gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Yes, Regenerate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
