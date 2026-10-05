import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { profile, uploadAvatar } from "../slice/profileSlice";
import ActivityHeatmap from "../components/heatMap";
import IndexLineChart from "../components/ratingGraph";
import { FiEdit2 } from "react-icons/fi";

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
    const currentUserId = useSelector((state) => state.auth.user._id);

    const isOwner = userId === currentUserId;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);
        dispatch(uploadAvatar({ id: userId, formData }));
        e.target.value = "";
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {isLoading && (
                    <div className="flex min-h-72 flex-col items-center justify-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500"></div>
                        <div className="text-sm text-slate-400">Loading profile…</div>
                    </div>
                )}

                {isError && (
                    <div className="border-y border-red-900 py-5 text-red-300">
                        Could not fetch profile data.
                    </div>
                )}

                {!isLoading && !isError && username && (
                    <>
                        <section className="flex flex-col gap-6 border-b border-slate-800 pb-8 sm:flex-row sm:items-center">
                            <div className="flex min-w-0 items-center gap-5">
                                <div className="group relative h-20 w-20 shrink-0">
                                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-slate-800 text-3xl font-semibold text-slate-200 ring-1 ring-slate-700">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            username.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    {isOwner && (
                                        <button
                                            type="button"
                                            aria-label="Edit profile picture"
                                            title="Edit profile picture"
                                            onClick={() => fileInputRef.current.click()}
                                            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-slate-800"
                                        >
                                            <FiEdit2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="mb-1 text-xs font-medium uppercase text-slate-500">CodeDuel profile</p>
                                    <h1 className="truncate text-2xl font-semibold sm:text-3xl">{username}</h1>
                                </div>
                            </div>
                            <div className="sm:ml-auto sm:border-l sm:border-slate-800 sm:pl-8">
                                <p className="text-xs font-medium uppercase text-slate-500">Rating</p>
                                <p className="mt-1 text-3xl font-semibold text-orange-300">{rating}</p>
                            </div>
                        </section>

                        <section aria-label="Match statistics" className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800 py-6">
                            <div className="px-3 first:pl-0 sm:px-6">
                                <p className="text-2xl font-semibold tabular-nums">{matchesPlayed}</p>
                                <p className="mt-1 text-sm text-slate-500">Matches</p>
                            </div>
                            <div className="px-3 sm:px-6">
                                <p className="text-2xl font-semibold tabular-nums text-emerald-400">{wins}</p>
                                <p className="mt-1 text-sm text-slate-500">Wins</p>
                            </div>
                            <div className="px-3 sm:px-6">
                                <p className="text-2xl font-semibold tabular-nums text-rose-400">{loss}</p>
                                <p className="mt-1 text-sm text-slate-500">Losses</p>
                            </div>
                        </section>

                        <section className="border-b border-slate-800 py-8 sm:py-10">
                            <h2 className="mb-5 text-lg font-semibold">Rating history</h2>
                            <IndexLineChart data={playerHistory} />
                        </section>

                        <section className="py-8 sm:py-10">
                            <h2 className="mb-5 text-lg font-semibold">Activity</h2>
                            <div className="overflow-x-auto pb-2">
                                <div className="min-w-[680px]">
                                    <ActivityHeatmap
                                        startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                                        activity={activityHistory}
                                    />
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}