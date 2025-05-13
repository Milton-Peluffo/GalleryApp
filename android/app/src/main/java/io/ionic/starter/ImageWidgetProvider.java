package io.ionic.starter;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.util.Log;
import android.widget.RemoteViews;
import android.os.Bundle;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.target.AppWidgetTarget;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class ImageWidgetProvider extends AppWidgetProvider {

    private static final String TAG = "ImageWidgetProvider";
    private static final String PREFS_NAME = "CapacitorStorage"; // Default @capacitor/preferences name
    private static final String GALLERY_ITEMS_KEY = "gallery_items"; // **IMPORTANTE: Ajusta esta clave si es diferente**
    //private static int currentIndex = -1; // Para rastrear la imagen actual

    private static final String WIDGET_STATE_PREFS_NAME = "ImageWidgetStatePrefs";
    private static final String KEY_CURRENT_INDEX_PREFIX = "currentIndex_";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Log.d(TAG, "onUpdate triggered");
        // Actualizar todos los widgets activos
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        Log.d(TAG, "Updating widget ID: " + appWidgetId);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.image_widget_layout);

        List<GalleryItem> galleryItems = getGalleryItems(context);

        // Obtener SharedPreferences para el estado del widget
        SharedPreferences widgetStatePrefs = context.getSharedPreferences(WIDGET_STATE_PREFS_NAME, Context.MODE_PRIVATE);
        // Obtener el índice actual para ESTE widgetId, default a -1 para empezar en 0 después de incrementar
        int widgetSpecificCurrentIndex = widgetStatePrefs.getInt(KEY_CURRENT_INDEX_PREFIX + appWidgetId, -1);

        if (galleryItems != null && !galleryItems.isEmpty()) {
            // Seleccionar la siguiente imagen
            widgetSpecificCurrentIndex++; // Incrementar el índice para este widget específico
            if (widgetSpecificCurrentIndex >= galleryItems.size()) {
                widgetSpecificCurrentIndex = 0; // Reiniciar si supera el tamaño de la lista
            }

            GalleryItem currentItem = galleryItems.get(widgetSpecificCurrentIndex);
            Log.d(TAG, "Displaying item for widget ID " + appWidgetId + ": index " + widgetSpecificCurrentIndex + ", URL: " + currentItem.imageUrl);

            // Actualizar descripción
            views.setTextViewText(R.id.widget_description, currentItem.description);

            // Cargar imagen usando Glide
            AppWidgetTarget appWidgetTarget = new AppWidgetTarget(context, R.id.widget_image, views, appWidgetId);
            Glide.with(context.getApplicationContext())
                 .asBitmap()
                 .load(currentItem.imageUrl)
                 .override(300, 300) // Ajusta el tamaño según sea necesario
                 .centerCrop()
                 .into(appWidgetTarget);

            // Guardar el nuevo índice para este widgetId
            widgetStatePrefs.edit().putInt(KEY_CURRENT_INDEX_PREFIX + appWidgetId, widgetSpecificCurrentIndex).apply();

        } else {
            Log.d(TAG, "No gallery items found or error reading preferences for widget ID " + appWidgetId);
            // Mostrar estado por defecto o mensaje de error
            views.setTextViewText(R.id.widget_description, "No hay imágenes");
            views.setImageViewResource(R.id.widget_image, R.mipmap.ic_launcher); // Imagen por defecto
            // Si no hay ítems, resetear/eliminar el índice guardado para este widget
            widgetStatePrefs.edit().remove(KEY_CURRENT_INDEX_PREFIX + appWidgetId).apply();
        }

        // Indicar al AppWidgetManager que actualice el widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static List<GalleryItem> getGalleryItems(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String jsonString = prefs.getString(GALLERY_ITEMS_KEY, null);
        Log.d(TAG, "Read from SharedPreferences (" + GALLERY_ITEMS_KEY + "): " + jsonString);

        if (jsonString == null) {
            return null;
        }

        List<GalleryItem> items = new ArrayList<>();
        try {
            JSONArray jsonArray = new JSONArray(jsonString);
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject jsonObject = jsonArray.getJSONObject(i);
                String imageUrl = jsonObject.optString("imageUrl", null);
                String description = jsonObject.optString("description", "");
                if (imageUrl != null) { // Solo añadir si la URL no es nula
                     items.add(new GalleryItem(imageUrl, description));
                }
            }
            Log.d(TAG, "Parsed " + items.size() + " items.");
            return items;
        } catch (JSONException e) {
            Log.e(TAG, "Error parsing JSON from SharedPreferences", e);
            return null;
        }
    }

    // Clase auxiliar para guardar los datos
    static class GalleryItem {
        String imageUrl;
        String description;

        GalleryItem(String imageUrl, String description) {
            this.imageUrl = imageUrl;
            this.description = description;
        }
    }

    // Opcional: Manejar la eliminación del widget si necesitas limpiar algo
    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        Log.d(TAG, "onDeleted called for widget IDs: " + java.util.Arrays.toString(appWidgetIds));
        // Limpiar el índice guardado para los widgets eliminados
        SharedPreferences.Editor editor = context.getSharedPreferences(WIDGET_STATE_PREFS_NAME, Context.MODE_PRIVATE).edit();
        for (int appWidgetId : appWidgetIds) {
            Log.d(TAG, "Removing state for deleted widget ID: " + appWidgetId);
            editor.remove(KEY_CURRENT_INDEX_PREFIX + appWidgetId);
        }
        editor.apply();
        super.onDeleted(context, appWidgetIds); // Llamada al método de la superclase
    }

    // Opcional: Manejar la primera creación del widget
    @Override
    public void onEnabled(Context context) {
        Log.d(TAG, "onEnabled: Widget created for the first time");
        // Podrías iniciar alguna configuración inicial si es necesario
    }

    // Opcional: Manejar cuando el último widget es eliminado
    @Override
    public void onDisabled(Context context) {
        Log.d(TAG, "onDisabled: Last widget instance deleted");
        // Podrías detener servicios o tareas en segundo plano
    }
}
