export default function Loading() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-zinc-800 border-t-orange-500" />
                <p className="text-zinc-500 text-sm animate-pulse">Loading Nazen...</p>
            </div>
        </div>
    );
}
