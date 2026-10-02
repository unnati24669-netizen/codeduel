import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { profile, uploadAvatar } from "../slice/profileSlice";
import ActivityHeatmap from "../components/heatMap";
import IndexLineChart from "../components/ratingGraph";
import { Pencil } from "lucide-react";

export default function Profile() {
    const { userId } = useParams();
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (userId) {
            dispatch(profile(userId));
        }
    }, [userId]);

    const username = useSelector((state) => state.profile.username);
    const rating = useSelector((state) => state.profile.rating);
    const matchesPlayed = useSelector((state) => state.profile.matchesPlayed);
    const wins = useSelector((state) => state.profile.wins);
    const loss = useSelector((state) => state.profile.loss);
    const playerHistory = useSelector((state) => state.profile.playerHistory);
    const activityHistory = useSelector((state) => state.profile.activityHistory);
    const isLoading = useSelector((state) => state.profile.isLoading);
    const isError = useSelector((state) => state.profile.isError);
    const avatarUrl = useSelector((state) => state.profile.avatarUrl);

    const isOwner = userId === localStorage.getItem("userId");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);
        dispatch(uploadAvatar({ id: userId, formData }));
        e.target.value = "";
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            {isLoading && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="text-slate-400 text-sm">Loading profile…</div>
                </div>
            )}

            {isError && (
                <div className="text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-4 py-3">
                    Could not fetch data
                </div>
            )}

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            {!isLoading && !isError && (
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative w-20 h-20 mb-3">
                            <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-semibold text-white overflow-hidden">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    username?.charAt(0).toUpperCase()
                                )}
                            </div>

                            {isOwner && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-200 hover:bg-slate-700 transition-colors"
                                >
                                    <Pencil size={14} />
                                </button>
                            )}
                        </div>
                        <h1 className="text-xl font-semibold text-slate-100">{username}</h1>
                        <span className="mt-1 text-sm text-indigo-400 bg-indigo-950/50 border border-indigo-900 px-3 py-1 rounded-full">
                            Rating: {rating}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 text-center">
                            <div className="text-lg font-semibold text-slate-100">{matchesPlayed}</div>
                            <div className="text-xs text-slate-500 mt-1">Matches</div>
                        </div>
                        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 text-center">
                            <div className="text-lg font-semibold text-green-400">{wins}</div>
                            <div className="text-xs text-slate-500 mt-1">Wins</div>
                        </div>
                        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 text-center">
                            <div className="text-lg font-semibold text-red-400">{loss}</div>
                            <div className="text-xs text-slate-500 mt-1">Losses</div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h2 className="text-lg font-semibold text-slate-100 mb-3">Rating History</h2>
                        <IndexLineChart data={playerHistory} />
                    </div>
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold text-slate-100 mb-3">Activity Heatmap</h2>
                        <ActivityHeatmap
                            startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                            activity={activityHistory}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}